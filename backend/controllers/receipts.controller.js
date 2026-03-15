// controllers/receipts.controller.js
const pool = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');
const { increaseStock } = require('../services/stock.service');
const { logMovement } = require('../services/movement.service');

// GET /api/receipts
const getReceipts = asyncHandler(async (req, res) => {
  const { status } = req.query;
  let query = `
    SELECT r.*, u.name AS created_by_name, l.name AS destination_name,
           COUNT(ri.id) AS item_count
    FROM receipts r
    LEFT JOIN users u ON u.id = r.created_by
    LEFT JOIN locations l ON l.id = r.destination_location
    LEFT JOIN receipt_items ri ON ri.receipt_id = r.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    params.push(status);
    query += ` AND r.status = $${params.length}`;
  }

  query += ' GROUP BY r.id, u.name, l.name ORDER BY r.created_at DESC';
  const result = await pool.query(query, params);
  res.json({ receipts: result.rows });
});

// GET /api/receipts/:id
const getReceiptById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const receiptResult = await pool.query(
    `SELECT r.*, u.name AS created_by_name, l.name AS destination_name
     FROM receipts r
     LEFT JOIN users u ON u.id = r.created_by
     LEFT JOIN locations l ON l.id = r.destination_location
     WHERE r.id = $1`,
    [id]
  );

  if (receiptResult.rows.length === 0) {
    return res.status(404).json({ error: 'Receipt not found.' });
  }

  const itemsResult = await pool.query(
    `SELECT ri.*, p.name AS product_name, p.sku, p.unit
     FROM receipt_items ri
     JOIN products p ON p.id = ri.product_id
     WHERE ri.receipt_id = $1`,
    [id]
  );

  res.json({ receipt: receiptResult.rows[0], items: itemsResult.rows });
});

// POST /api/receipts
const createReceipt = asyncHandler(async (req, res) => {
  const { supplier, destination_location, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'At least one item is required.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const receiptResult = await client.query(
      `INSERT INTO receipts (supplier, destination_location, created_by, status)
       VALUES ($1, $2, $3, 'draft') RETURNING *`,
      [supplier, destination_location, req.user.id]
    );

    const receipt = receiptResult.rows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO receipt_items (receipt_id, product_id, quantity) VALUES ($1, $2, $3)`,
        [receipt.id, item.product_id, item.quantity]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Receipt created.', receipt });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// POST /api/receipts/:id/validate
const validateReceipt = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const receiptResult = await client.query(
      'SELECT * FROM receipts WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (receiptResult.rows.length === 0) {
      return res.status(404).json({ error: 'Receipt not found.' });
    }

    const receipt = receiptResult.rows[0];

    if (receipt.status === 'done') {
      return res.status(400).json({ error: 'Receipt already validated.' });
    }
    if (receipt.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot validate a cancelled receipt.' });
    }

    const items = await client.query(
      'SELECT * FROM receipt_items WHERE receipt_id = $1',
      [id]
    );

    for (const item of items.rows) {
      await increaseStock(client, {
        productId: item.product_id,
        locationId: receipt.destination_location,
        quantity: item.quantity,
      });

      await logMovement(client, {
        productId: item.product_id,
        type: 'receipt',
        destinationLocationId: receipt.destination_location,
        quantity: item.quantity,
        reference: `Receipt #${id} | Supplier: ${receipt.supplier || 'N/A'}`,
        createdBy: req.user.id,
      });
    }

    await client.query(
      `UPDATE receipts SET status = 'done', validated_at = NOW() WHERE id = $1`,
      [id]
    );

    await client.query('COMMIT');
    res.json({ message: `Receipt #${id} validated. Stock updated.` });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// PATCH /api/receipts/:id/cancel
const cancelReceipt = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `UPDATE receipts SET status = 'cancelled'
     WHERE id = $1 AND status != 'done' RETURNING id`,
    [req.params.id]
  );
  if (result.rows.length === 0) {
    return res.status(400).json({ error: 'Cannot cancel this receipt.' });
  }
  res.json({ message: 'Receipt cancelled.' });
});

module.exports = { getReceipts, getReceiptById, createReceipt, validateReceipt, cancelReceipt };