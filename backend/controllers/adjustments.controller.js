// controllers/adjustments.controller.js
const pool = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');
const { adjustStock } = require('../services/stock.service');
const { logMovement } = require('../services/movement.service');

// GET /api/adjustments
const getAdjustments = asyncHandler(async (req, res) => {
  const result = await pool.query(`
    SELECT a.*, p.name AS product_name, p.sku,
           l.name AS location_name, u.name AS created_by_name
    FROM adjustments a
    JOIN products p ON p.id = a.product_id
    JOIN locations l ON l.id = a.location_id
    LEFT JOIN users u ON u.id = a.created_by
    ORDER BY a.created_at DESC
  `);
  res.json({ adjustments: result.rows });
});

// POST /api/adjustments
const createAdjustment = asyncHandler(async (req, res) => {
  const { product_id, location_id, counted_quantity, reason } = req.body;

  if (!product_id || !location_id || counted_quantity === undefined) {
    return res.status(400).json({ error: 'Product, location, and counted quantity are required.' });
  }
  if (counted_quantity < 0) {
    return res.status(400).json({ error: 'Counted quantity cannot be negative.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // adjustStock returns { systemQuantity, difference }
    const { systemQuantity, difference } = await adjustStock(client, {
      productId: product_id,
      locationId: location_id,
      countedQuantity: counted_quantity,
    });

    // Record the adjustment
    const adjResult = await client.query(
      `INSERT INTO adjustments (product_id, location_id, system_quantity, counted_quantity, reason, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [product_id, location_id, systemQuantity, counted_quantity, reason, req.user.id]
    );

    await logMovement(client, {
      productId: product_id,
      type: 'adjustment',
      sourceLocationId: location_id,
      destinationLocationId: location_id,
      quantity: Math.abs(difference),
      reference: `Adjustment: ${difference >= 0 ? '+' : ''}${difference} | Reason: ${reason || 'Manual count'}`,
      createdBy: req.user.id,
    });

    await client.query('COMMIT');
    res.status(201).json({
      message: `Stock adjusted. Difference: ${difference >= 0 ? '+' : ''}${difference}`,
      adjustment: adjResult.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

module.exports = { getAdjustments, createAdjustment };