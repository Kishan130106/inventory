// services/stock.service.js
// ALL stock mutations go through here. Never write raw stock SQL in controllers.
// Every function accepts a pg client (for transaction support).

const movementService = require('./movement.service');

/**
 * Increase stock at a location.
 * Called by: receipts validate
 */
const increaseStock = async (client, { productId, locationId, quantity }) => {
  await client.query(
    `INSERT INTO stock (product_id, location_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (product_id, location_id)
     DO UPDATE SET quantity = stock.quantity + EXCLUDED.quantity, updated_at = NOW()`,
    [productId, locationId, quantity]
  );
};

/**
 * Decrease stock at a location.
 * Throws an error with product name if insufficient stock.
 * Called by: deliveries validate
 */
const decreaseStock = async (client, { productId, locationId, quantity }) => {
  // Lock the row for update to prevent race conditions
  const result = await client.query(
    `SELECT s.quantity, p.name AS product_name
     FROM stock s
     JOIN products p ON p.id = s.product_id
     WHERE s.product_id = $1 AND s.location_id = $2
     FOR UPDATE`,
    [productId, locationId]
  );

  const current = result.rows[0]?.quantity || 0;
  const productName = result.rows[0]?.product_name || `Product #${productId}`;

  if (current < quantity) {
    const err = new Error(
      `Insufficient stock for "${productName}". Available: ${current}, Requested: ${quantity}`
    );
    err.status = 400;
    throw err;
  }

  await client.query(
    `UPDATE stock
     SET quantity = quantity - $1, updated_at = NOW()
     WHERE product_id = $2 AND location_id = $3`,
    [quantity, productId, locationId]
  );
};

/**
 * Move stock from one location to another.
 * Decreases source, increases destination atomically.
 * Called by: transfers validate
 */
const transferStock = async (client, { productId, sourceLocationId, destinationLocationId, quantity }) => {
  await decreaseStock(client, { productId, locationId: sourceLocationId, quantity });
  await increaseStock(client, { productId, locationId: destinationLocationId, quantity });
};

/**
 * Set stock to an exact counted quantity (physical count).
 * Returns the difference (positive = gain, negative = loss).
 * Called by: adjustments create
 */
const adjustStock = async (client, { productId, locationId, countedQuantity }) => {
  // Get current system quantity
  const result = await client.query(
    `SELECT quantity FROM stock
     WHERE product_id = $1 AND location_id = $2
     FOR UPDATE`,
    [productId, locationId]
  );

  const systemQuantity = result.rows[0]?.quantity || 0;
  const difference = countedQuantity - systemQuantity;

  // Upsert to the counted quantity
  await client.query(
    `INSERT INTO stock (product_id, location_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (product_id, location_id)
     DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = NOW()`,
    [productId, locationId, countedQuantity]
  );

  return { systemQuantity, difference };
};

/**
 * Get current stock quantity for a product at a location.
 * Uses pool directly (read-only, no transaction needed).
 */
const getStockQuantity = async (pool, { productId, locationId }) => {
  const result = await pool.query(
    `SELECT quantity FROM stock WHERE product_id = $1 AND location_id = $2`,
    [productId, locationId]
  );
  return result.rows[0]?.quantity || 0;
};

module.exports = {
  increaseStock,
  decreaseStock,
  transferStock,
  adjustStock,
  getStockQuantity,
};
