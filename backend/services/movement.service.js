// services/movement.service.js
// Single source of truth for writing to the movements ledger.
// Always call this inside the same transaction as the stock mutation.

/**
 * Log a stock movement to the ledger.
 *
 * @param {object} client       - pg transaction client
 * @param {object} params
 * @param {number} params.productId
 * @param {string} params.type          - 'receipt' | 'delivery' | 'transfer' | 'adjustment'
 * @param {number} [params.sourceLocationId]
 * @param {number} [params.destinationLocationId]
 * @param {number} params.quantity
 * @param {string} [params.reference]   - human-readable ref e.g. "Receipt #12 | Supplier: XYZ"
 * @param {number} [params.createdBy]   - user id
 */
const logMovement = async (client, {
  productId,
  type,
  sourceLocationId = null,
  destinationLocationId = null,
  quantity,
  reference = null,
  createdBy = null,
}) => {
  await client.query(
    `INSERT INTO movements
       (product_id, type, source_location, destination_location, quantity, reference, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [productId, type, sourceLocationId, destinationLocationId, quantity, reference, createdBy]
  );
};

module.exports = { logMovement };
