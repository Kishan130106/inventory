// controllers/locations.controller.js
const pool = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/locations
const getLocations = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT l.*, COUNT(s.id) AS product_count
     FROM locations l
     LEFT JOIN stock s ON s.location_id = l.id AND s.quantity > 0
     GROUP BY l.id
     ORDER BY l.name ASC`
  );
  res.json({ locations: result.rows });
});

// GET /api/locations/:id
const getLocationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const locationResult = await pool.query(
    'SELECT * FROM locations WHERE id = $1',
    [id]
  );

  if (locationResult.rows.length === 0) {
    return res.status(404).json({ error: 'Location not found.' });
  }

  // Get all stock at this location
  const stockResult = await pool.query(
    `SELECT s.quantity, p.id AS product_id, p.name AS product_name,
            p.sku, p.unit, p.reorder_level,
            CASE
              WHEN s.quantity = 0 THEN 'out_of_stock'
              WHEN s.quantity <= p.reorder_level THEN 'low_stock'
              ELSE 'in_stock'
            END AS stock_status
     FROM stock s
     JOIN products p ON p.id = s.product_id
     WHERE s.location_id = $1
     ORDER BY p.name ASC`,
    [id]
  );

  res.json({ location: locationResult.rows[0], stock: stockResult.rows });
});

// POST /api/locations
const createLocation = asyncHandler(async (req, res) => {
  const { name, type } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required.' });

  const result = await pool.query(
    'INSERT INTO locations (name, type) VALUES ($1, $2) RETURNING *',
    [name, type || 'warehouse']
  );
  res.status(201).json({ message: 'Location created.', location: result.rows[0] });
});

// PUT /api/locations/:id
const updateLocation = asyncHandler(async (req, res) => {
  const { name, type } = req.body;

  const result = await pool.query(
    `UPDATE locations
     SET name = COALESCE($1, name), type = COALESCE($2, type)
     WHERE id = $3 RETURNING *`,
    [name, type, req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Location not found.' });
  }
  res.json({ message: 'Location updated.', location: result.rows[0] });
});

// DELETE /api/locations/:id
const deleteLocation = asyncHandler(async (req, res) => {
  // Prevent deleting a location that still has stock
  const stockCheck = await pool.query(
    'SELECT COUNT(*) FROM stock WHERE location_id = $1 AND quantity > 0',
    [req.params.id]
  );

  if (parseInt(stockCheck.rows[0].count) > 0) {
    return res.status(400).json({
      error: 'Cannot delete a location that still has stock. Transfer or adjust stock to zero first.',
    });
  }

  const result = await pool.query(
    'DELETE FROM locations WHERE id = $1 RETURNING id',
    [req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Location not found.' });
  }
  res.json({ message: 'Location deleted.' });
});

module.exports = { getLocations, getLocationById, createLocation, updateLocation, deleteLocation };