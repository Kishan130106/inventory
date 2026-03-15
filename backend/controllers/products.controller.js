// controllers/products.controller.js
const pool = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');
const { increaseStock } = require('../services/stock.service');
const { logMovement } = require('../services/movement.service');

// GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const { category_id, sport_type, search } = req.query;

  let query = `
    SELECT p.*, c.name AS category_name,
           COALESCE(SUM(s.quantity), 0) AS total_stock
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN stock s ON s.product_id = p.id
    WHERE 1=1
  `;
  const params = [];

  if (category_id) {
    params.push(category_id);
    query += ` AND p.category_id = $${params.length}`;
  }
  if (sport_type) {
    params.push(`%${sport_type}%`);
    query += ` AND p.sport_type ILIKE $${params.length}`;
  }
  if (search) {
    params.push(`%${search}%`);
    query += ` AND (p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length})`;
  }

  query += ' GROUP BY p.id, c.name ORDER BY p.name ASC';

  const result = await pool.query(query, params);
  res.json({ products: result.rows });
});

// GET /api/products/low-stock
const getLowStock = asyncHandler(async (req, res) => {
  const result = await pool.query(`
    SELECT * FROM stock_summary
    WHERE stock_status IN ('low_stock', 'out_of_stock')
    ORDER BY quantity ASC
  `);
  res.json({ items: result.rows });
});

// GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const productResult = await pool.query(
    `SELECT p.*, c.name AS category_name
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.id = $1`,
    [id]
  );

  if (productResult.rows.length === 0) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  const stockResult = await pool.query(
    `SELECT s.quantity, l.id AS location_id, l.name AS location_name, l.type AS location_type
     FROM stock s
     JOIN locations l ON l.id = s.location_id
     WHERE s.product_id = $1`,
    [id]
  );

  res.json({ product: productResult.rows[0], stock: stockResult.rows });
});

// POST /api/products
const createProduct = asyncHandler(async (req, res) => {
  const { name, sku, sport_type, category_id, unit, reorder_level, initial_stock, location_id } = req.body;

  if (!name || !sku) {
    return res.status(400).json({ error: 'Name and SKU are required.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO products (name, sku, sport_type, category_id, unit, reorder_level)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, sku, sport_type, category_id, unit || 'pieces', reorder_level || 5]
    );

    const product = result.rows[0];

    if (initial_stock > 0 && location_id) {
      await increaseStock(client, { productId: product.id, locationId: location_id, quantity: initial_stock });
      await logMovement(client, {
        productId: product.id,
        type: 'receipt',
        destinationLocationId: location_id,
        quantity: initial_stock,
        reference: 'Initial Stock',
        createdBy: req.user.id,
      });
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Product created.', product });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const { name, sku, sport_type, category_id, unit, reorder_level } = req.body;

  const result = await pool.query(
    `UPDATE products
     SET name = COALESCE($1, name), sku = COALESCE($2, sku),
         sport_type = COALESCE($3, sport_type), category_id = COALESCE($4, category_id),
         unit = COALESCE($5, unit), reorder_level = COALESCE($6, reorder_level)
     WHERE id = $7 RETURNING *`,
    [name, sku, sport_type, category_id, unit, reorder_level, req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  res.json({ message: 'Product updated.', product: result.rows[0] });
});

// DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const result = await pool.query(
    'DELETE FROM products WHERE id = $1 RETURNING id',
    [req.params.id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  res.json({ message: 'Product deleted.' });
});

module.exports = { getProducts, getLowStock, getProductById, createProduct, updateProduct, deleteProduct };