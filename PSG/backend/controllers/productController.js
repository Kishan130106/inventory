const pool = require('../config/db');

const getAll = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = `
      SELECT p.*, COALESCE(SUM(s.on_hand), 0) as total_stock,
             COALESCE(SUM(s.free_to_use), 0) as free_stock
      FROM products p
      LEFT JOIN stock s ON s.product_id = p.id
    `;
    const params = [];
    const conditions = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length})`);
    }
    if (category) {
      params.push(category);
      conditions.push(`p.category = $${params.length}`);
    }

    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' GROUP BY p.id ORDER BY p.name';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await pool.query('SELECT * FROM products WHERE id=$1', [id]);
    if (!product.rows.length) return res.status(404).json({ success: false, message: 'Product not found.' });

    const stockByLocation = await pool.query(`
      SELECT s.*, l.name as location_name, w.name as warehouse_name
      FROM stock s
      JOIN locations l ON l.id = s.location_id
      JOIN warehouses w ON w.id = l.warehouse_id
      WHERE s.product_id = $1
    `, [id]);

    res.json({ success: true, data: { ...product.rows[0], stock: stockByLocation.rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  const { name, sku, category, unit_of_measure, unit_cost, description, reorder_level } = req.body;
  if (!name || !sku) return res.status(400).json({ success: false, message: 'Name and SKU required.' });

  try {
    const result = await pool.query(
      'INSERT INTO products (name, sku, category, unit_of_measure, unit_cost, description, reorder_level) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [name, sku, category, unit_of_measure || 'pcs', unit_cost || 0, description, reorder_level || 10]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ success: false, message: 'SKU already exists.' });
    res.status(500).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const { name, sku, category, unit_of_measure, unit_cost, description, reorder_level } = req.body;
  try {
    const result = await pool.query(
      'UPDATE products SET name=$1, sku=$2, category=$3, unit_of_measure=$4, unit_cost=$5, description=$6, reorder_level=$7 WHERE id=$8 RETURNING *',
      [name, sku, category, unit_of_measure, unit_cost, description, reorder_level, id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, message: 'Product deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category');
    res.json({ success: true, data: result.rows.map(r => r.category) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove, getCategories };
