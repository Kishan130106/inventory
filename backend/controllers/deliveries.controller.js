// controllers/deliveries.controller.js
const pool = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');
const { decreaseStock } = require('../services/stock.service');
const { logMovement } = require('../services/movement.service');

// GET /api/deliveries
const getDeliveries = asyncHandler(async (req, res) => {
  const { status } = req.query;
  let query = `
    SELECT d.*, u.name AS created_by_name, l.name AS source_location_name,
           COUNT(di.id) AS item_count
    FROM deliveries d
    LEFT JOIN users u ON u.id = d.created_by
    LEFT JOIN locations l ON l.id = d.source_location
    LEFT JOIN delivery_items di ON di.delivery_id = d.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    params.push(status);
    query += ` AND d.status = $${params.length}`;
  }

  query += ' GROUP BY d.id, u.name, l.name ORDER BY d.created_at DESC';
  const result = await pool.query(query, params);
  res.json({ deliveries: result.rows });
});

// GET /api/deliveries/:id
const getDeliveryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deliveryResult = await pool.query(
    `SELECT d.*, u.name AS created_by_name, l.name AS source_location_name
     FROM deliveries d
     LEFT JOIN users u ON u.id = d.created_by
     LEFT JOIN locations l ON l.id = d.source_location
     WHERE d.id = $1`,
    [id]
  );

  if (deliveryResult.rows.length === 0) {
    return res.status(404).json({ error: 'Delivery not found.' });
  }

  const itemsResult = await pool.query(
    `SELECT di.*, p.name AS product_name, p.sku, p.unit
     FROM delivery_items di
     JOIN products p ON p.id = di.product_id
     WHERE di.delivery_id = $1`,
    [id]
  );

  res.json({ delivery: deliveryResult.rows[0], items: itemsResult.rows });
});

// POST /api/deliveries
const createDelivery = asyncHandler(async (req, res) => {
  const { customer, source_location, items } = req.body;

  if (!source_location) return res.status(400).json({ error: 'Source location is required.' });
  if (!items || items.length === 0) return res.status(400).json({ error: 'At least one item is required.' });

  // Pre-check stock availability before creating the record
  for (const item of items) {
    const stockResult = await pool.query(
      `SELECT s.quantity, p.name AS product_name
       FROM stock s JOIN products p ON p.id = s.product_id
       WHERE s.product_id = $1 AND s.location_id = $2`,
      [item.product_id, source_location]
    );

    const available = stockResult.rows[0]?.quantity || 0;
    const productName = stockResult.rows[0]?.product_name || `Product #${item.product_id}`;

    if (available < item.quantity) {
      return res.status(400).json({
        error: `Insufficient stock for "${productName}". Available: ${available}, Requested: ${item.quantity}`,
      });
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const deliveryResult = await client.query(
      `INSERT INTO deliveries (customer, source_location, created_by, status)
       VALUES ($1, $2, $3, 'draft') RETURNING *`,
      [customer, source_location, req.user.id]
    );

    const delivery = deliveryResult.rows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO delivery_items (delivery_id, product_id, quantity) VALUES ($1, $2, $3)`,
        [delivery.id, item.product_id, item.quantity]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Delivery created.', delivery });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// POST /api/deliveries/:id/validate
const validateDelivery = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const deliveryResult = await client.query(
      'SELECT * FROM deliveries WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (deliveryResult.rows.length === 0) {
      return res.status(404).json({ error: 'Delivery not found.' });
    }

    const delivery = deliveryResult.rows[0];

    if (delivery.status === 'done') return res.status(400).json({ error: 'Delivery already validated.' });
    if (delivery.status === 'cancelled') return res.status(400).json({ error: 'Cannot validate a cancelled delivery.' });

    const items = await client.query(
      'SELECT * FROM delivery_items WHERE delivery_id = $1',
      [id]
    );

    for (const item of items.rows) {
      // decreaseStock does the lock + availability check internally
      await decreaseStock(client, {
        productId: item.product_id,
        locationId: delivery.source_location,
        quantity: item.quantity,
      });

      await logMovement(client, {
        productId: item.product_id,
        type: 'delivery',
        sourceLocationId: delivery.source_location,
        quantity: item.quantity,
        reference: `Delivery #${id} | Customer: ${delivery.customer || 'N/A'}`,
        createdBy: req.user.id,
      });
    }

    await client.query(
      `UPDATE deliveries SET status = 'done', validated_at = NOW() WHERE id = $1`,
      [id]
    );

    await client.query('COMMIT');
    res.json({ message: `Delivery #${id} validated. Stock updated.` });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// PATCH /api/deliveries/:id/cancel
const cancelDelivery = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `UPDATE deliveries SET status = 'cancelled'
     WHERE id = $1 AND status != 'done' RETURNING id`,
    [req.params.id]
  );
  if (result.rows.length === 0) {
    return res.status(400).json({ error: 'Cannot cancel this delivery.' });
  }
  res.json({ message: 'Delivery cancelled.' });
});

module.exports = { getDeliveries, getDeliveryById, createDelivery, validateDelivery, cancelDelivery };
