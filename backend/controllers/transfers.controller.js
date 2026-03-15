// controllers/transfers.controller.js
const pool = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');
const { transferStock } = require('../services/stock.service');
const { logMovement } = require('../services/movement.service');

// GET /api/transfers
const getTransfers = asyncHandler(async (req, res) => {
  const { status } = req.query;
  let query = `
    SELECT t.*, src.name AS source_name, dst.name AS destination_name,
           u.name AS created_by_name, COUNT(ti.id) AS item_count
    FROM transfers t
    LEFT JOIN locations src ON src.id = t.source_location
    LEFT JOIN locations dst ON dst.id = t.destination_location
    LEFT JOIN users u ON u.id = t.created_by
    LEFT JOIN transfer_items ti ON ti.transfer_id = t.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    params.push(status);
    query += ` AND t.status = $${params.length}`;
  }

  query += ' GROUP BY t.id, src.name, dst.name, u.name ORDER BY t.created_at DESC';
  const result = await pool.query(query, params);
  res.json({ transfers: result.rows });
});

// GET /api/transfers/:id
const getTransferById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const transferResult = await pool.query(
    `SELECT t.*, src.name AS source_name, dst.name AS destination_name, u.name AS created_by_name
     FROM transfers t
     LEFT JOIN locations src ON src.id = t.source_location
     LEFT JOIN locations dst ON dst.id = t.destination_location
     LEFT JOIN users u ON u.id = t.created_by
     WHERE t.id = $1`,
    [id]
  );

  if (transferResult.rows.length === 0) {
    return res.status(404).json({ error: 'Transfer not found.' });
  }

  const itemsResult = await pool.query(
    `SELECT ti.*, p.name AS product_name, p.sku, p.unit
     FROM transfer_items ti
     JOIN products p ON p.id = ti.product_id
     WHERE ti.transfer_id = $1`,
    [id]
  );

  res.json({ transfer: transferResult.rows[0], items: itemsResult.rows });
});

// POST /api/transfers
const createTransfer = asyncHandler(async (req, res) => {
  const { source_location, destination_location, items, notes } = req.body;

  if (!source_location || !destination_location) {
    return res.status(400).json({ error: 'Source and destination locations are required.' });
  }
  if (source_location === destination_location) {
    return res.status(400).json({ error: 'Source and destination cannot be the same location.' });
  }
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'At least one item is required.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const transferResult = await client.query(
      `INSERT INTO transfers (source_location, destination_location, notes, created_by, status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
      [source_location, destination_location, notes, req.user.id]
    );

    const transfer = transferResult.rows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO transfer_items (transfer_id, product_id, quantity) VALUES ($1, $2, $3)`,
        [transfer.id, item.product_id, item.quantity]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Transfer created.', transfer });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// POST /api/transfers/:id/validate
const validateTransfer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const transferResult = await client.query(
      'SELECT * FROM transfers WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (transferResult.rows.length === 0) {
      return res.status(404).json({ error: 'Transfer not found.' });
    }

    const transfer = transferResult.rows[0];

    if (transfer.status === 'done') return res.status(400).json({ error: 'Transfer already completed.' });
    if (transfer.status === 'cancelled') return res.status(400).json({ error: 'Cannot validate a cancelled transfer.' });

    const items = await client.query(
      'SELECT * FROM transfer_items WHERE transfer_id = $1',
      [id]
    );

    for (const item of items.rows) {
      await transferStock(client, {
        productId: item.product_id,
        sourceLocationId: transfer.source_location,
        destinationLocationId: transfer.destination_location,
        quantity: item.quantity,
      });

      await logMovement(client, {
        productId: item.product_id,
        type: 'transfer',
        sourceLocationId: transfer.source_location,
        destinationLocationId: transfer.destination_location,
        quantity: item.quantity,
        reference: `Transfer #${id}`,
        createdBy: req.user.id,
      });
    }

    await client.query(
      `UPDATE transfers SET status = 'done', validated_at = NOW() WHERE id = $1`,
      [id]
    );

    await client.query('COMMIT');
    res.json({ message: `Transfer #${id} completed. Stock moved.` });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// PATCH /api/transfers/:id/cancel
const cancelTransfer = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `UPDATE transfers SET status = 'cancelled'
     WHERE id = $1 AND status != 'done' RETURNING id`,
    [req.params.id]
  );
  if (result.rows.length === 0) {
    return res.status(400).json({ error: 'Cannot cancel this transfer.' });
  }
  res.json({ message: 'Transfer cancelled.' });
});

module.exports = { getTransfers, getTransferById, createTransfer, validateTransfer, cancelTransfer };