// controllers/dashboard.controller.js
const pool = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/dashboard
const getStats = asyncHandler(async (req, res) => {
  const [
    totalProducts,
    lowStock,
    outOfStock,
    pendingReceipts,
    pendingDeliveries,
    pendingTransfers,
    recentMovements,
  ] = await Promise.all([
    pool.query('SELECT COUNT(DISTINCT product_id) AS count FROM stock WHERE quantity > 0'),
    pool.query(`SELECT COUNT(*) AS count FROM stock_summary WHERE stock_status = 'low_stock'`),
    pool.query(`SELECT COUNT(*) AS count FROM stock_summary WHERE stock_status = 'out_of_stock'`),
    pool.query(`SELECT COUNT(*) AS count FROM receipts WHERE status IN ('draft', 'waiting')`),
    pool.query(`SELECT COUNT(*) AS count FROM deliveries WHERE status IN ('draft', 'waiting', 'ready')`),
    pool.query(`SELECT COUNT(*) AS count FROM transfers WHERE status IN ('pending', 'in_transit')`),
    pool.query(`
      SELECT m.*, p.name AS product_name, p.sku,
             src.name AS source_name, dst.name AS destination_name,
             u.name AS created_by_name
      FROM movements m
      JOIN products p ON p.id = m.product_id
      LEFT JOIN locations src ON src.id = m.source_location
      LEFT JOIN locations dst ON dst.id = m.destination_location
      LEFT JOIN users u ON u.id = m.created_by
      ORDER BY m.created_at DESC
      LIMIT 10
    `),
  ]);

  res.json({
    kpis: {
      total_products: parseInt(totalProducts.rows[0].count),
      low_stock: parseInt(lowStock.rows[0].count),
      out_of_stock: parseInt(outOfStock.rows[0].count),
      pending_receipts: parseInt(pendingReceipts.rows[0].count),
      pending_deliveries: parseInt(pendingDeliveries.rows[0].count),
      pending_transfers: parseInt(pendingTransfers.rows[0].count),
    },
    recent_movements: recentMovements.rows,
  });
});

module.exports = { getStats };