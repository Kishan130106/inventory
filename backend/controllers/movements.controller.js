// controllers/movements.controller.js
const pool = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/movements
const getMovements = asyncHandler(async (req, res) => {
  const { type, product_id, location_id, limit = 50, offset = 0 } = req.query;

  let where = 'WHERE 1=1';
  const params = [];

  if (type) {
    params.push(type);
    where += ` AND m.type = $${params.length}`;
  }
  if (product_id) {
    params.push(parseInt(product_id));
    where += ` AND m.product_id = $${params.length}`;
  }
  if (location_id) {
    params.push(parseInt(location_id));
    where += ` AND (m.source_location = $${params.length} OR m.destination_location = $${params.length})`;
  }

  params.push(parseInt(limit), parseInt(offset));

  const result = await pool.query(
    `SELECT m.*, p.name AS product_name, p.sku,
            src.name AS source_name, dst.name AS destination_name,
            u.name AS created_by_name
     FROM movements m
     JOIN products p ON p.id = m.product_id
     LEFT JOIN locations src ON src.id = m.source_location
     LEFT JOIN locations dst ON dst.id = m.destination_location
     LEFT JOIN users u ON u.id = m.created_by
     ${where}
     ORDER BY m.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  // Count total for pagination (reuse same where clause without limit/offset)
  const countParams = params.slice(0, params.length - 2);
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM movements m ${where}`,
    countParams
  );

  res.json({
    movements: result.rows,
    total: parseInt(countResult.rows[0].count),
    limit: parseInt(limit),
    offset: parseInt(offset),
  });
});

module.exports = { getMovements };