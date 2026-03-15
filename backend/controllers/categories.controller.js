// controllers/categories.controller.js
const pool = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');

const getCategories = asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
  res.json({ categories: result.rows });
});

const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required.' });

  const result = await pool.query(
    'INSERT INTO categories (name) VALUES ($1) RETURNING *',
    [name]
  );
  res.status(201).json({ message: 'Category created.', category: result.rows[0] });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const result = await pool.query(
    'DELETE FROM categories WHERE id = $1 RETURNING id',
    [req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found.' });
  res.json({ message: 'Category deleted.' });
});

module.exports = { getCategories, createCategory, deleteCategory };