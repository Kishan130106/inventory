const pool = require('../config/db');

// ── DASHBOARD ──────────────────────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const [products, lowStock, pendingReceipts, pendingDeliveries, recentMoves] = await Promise.all([
      pool.query('SELECT COUNT(*) as total FROM products'),
      pool.query(`SELECT COUNT(*) as total FROM products p
        LEFT JOIN (SELECT product_id, SUM(on_hand) as total FROM stock GROUP BY product_id) s ON s.product_id=p.id
        WHERE COALESCE(s.total, 0) <= p.reorder_level`),
      pool.query("SELECT COUNT(*) as total FROM receipts WHERE status NOT IN ('Done','Canceled')"),
      pool.query("SELECT COUNT(*) as total FROM deliveries WHERE status NOT IN ('Done','Canceled')"),
      pool.query(`SELECT mh.*, p.name as product_name FROM move_history mh
        LEFT JOIN products p ON p.id=mh.product_id ORDER BY mh.created_at DESC LIMIT 10`)
    ]);

    res.json({
      success: true,
      data: {
        total_products: parseInt(products.rows[0].total),
        low_stock: parseInt(lowStock.rows[0].total),
        pending_receipts: parseInt(pendingReceipts.rows[0].total),
        pending_deliveries: parseInt(pendingDeliveries.rows[0].total),
        recent_moves: recentMoves.rows
      }
    });
  } catch (err) {
    console.error('🔴 DASHBOARD ERROR:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── STOCK ADJUSTMENTS ──────────────────────────────────────
const getAdjustments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT sa.*, p.name as product_name, p.sku, l.name as location_name
      FROM stock_adjustments sa
      JOIN products p ON p.id=sa.product_id
      JOIN locations l ON l.id=sa.location_id
      ORDER BY sa.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('🔴 ADJUSTMENTS ERROR:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const createAdjustment = async (req, res) => {
  const { product_id, location_id, new_quantity, reason } = req.body;
  if (!product_id || !location_id || new_quantity === undefined)
    return res.status(400).json({ success: false, message: 'product_id, location_id, new_quantity required.' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const current = await client.query(
      'SELECT on_hand FROM stock WHERE product_id=$1 AND location_id=$2',
      [product_id, location_id]
    );
    const oldQty = current.rows.length ? current.rows[0].on_hand : 0;

    if (current.rows.length) {
      await client.query(
        'UPDATE stock SET on_hand=$1, free_to_use=$1, updated_at=NOW() WHERE product_id=$2 AND location_id=$3',
        [new_quantity, product_id, location_id]
      );
    } else {
      await client.query(
        'INSERT INTO stock (product_id, location_id, on_hand, free_to_use) VALUES ($1,$2,$3,$3)',
        [product_id, location_id, new_quantity]
      );
    }

    const refResult = await client.query("SELECT reference FROM stock_adjustments ORDER BY id DESC LIMIT 1");
    const num = refResult.rows.length ? parseInt(refResult.rows[0].reference.split('/')[2]) + 1 : 1;
    const reference = `WH/ADJ/${String(num).padStart(4, '0')}`;

    await client.query(
      'INSERT INTO stock_adjustments (reference, product_id, location_id, old_quantity, new_quantity, reason, adjusted_by) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [reference, product_id, location_id, oldQty, new_quantity, reason, req.user?.email || 'system']
    );

    await client.query(
      'INSERT INTO move_history (reference, operation_type, from_location, to_location, product_id, quantity, contact, schedule_date, status) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),$8)',
      [reference, 'Adjustment', 'Physical Count', 'Stock', product_id, new_quantity - oldQty, req.user?.email || 'system', 'Done']
    );

    await client.query('COMMIT');
    res.status(201).json({ success: true, message: 'Stock adjusted successfully.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('🔴 CREATE ADJUSTMENT ERROR:', err.message);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};

// ── INTERNAL TRANSFERS ─────────────────────────────────────
const getTransfers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT it.*,
        fl.name as from_location_name, tl.name as to_location_name
      FROM internal_transfers it
      LEFT JOIN locations fl ON fl.id=it.from_location_id
      LEFT JOIN locations tl ON tl.id=it.to_location_id
      ORDER BY it.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('🔴 TRANSFERS ERROR:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getTransferById = async (req, res) => {
  try {
    const transfer = await pool.query(`
      SELECT it.*, fl.name as from_location_name, tl.name as to_location_name
      FROM internal_transfers it
      LEFT JOIN locations fl ON fl.id=it.from_location_id
      LEFT JOIN locations tl ON tl.id=it.to_location_id
      WHERE it.id=$1`, [req.params.id]);
    if (!transfer.rows.length) return res.status(404).json({ success: false, message: 'Transfer not found.' });
    const items = await pool.query(
      'SELECT ti.*, p.name as product_name, p.sku FROM transfer_items ti JOIN products p ON p.id=ti.product_id WHERE ti.transfer_id=$1',
      [req.params.id]
    );
    res.json({ success: true, data: { ...transfer.rows[0], items: items.rows } });
  } catch (err) {
    console.error('🔴 TRANSFER BY ID ERROR:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const createTransfer = async (req, res) => {
  const { from_location_id, to_location_id, responsible, schedule_date, notes, items } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const refResult = await client.query("SELECT reference FROM internal_transfers ORDER BY id DESC LIMIT 1");
    const num = refResult.rows.length ? parseInt(refResult.rows[0].reference.split('/')[2]) + 1 : 1;
    const reference = `WH/INT/${String(num).padStart(4, '0')}`;

    const transfer = await client.query(
      'INSERT INTO internal_transfers (reference, from_location_id, to_location_id, responsible, schedule_date, notes, status) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [reference, from_location_id, to_location_id, responsible, schedule_date, notes, 'Draft']
    );
    if (items && items.length) {
      for (const item of items) {
        await client.query('INSERT INTO transfer_items (transfer_id, product_id, quantity) VALUES ($1,$2,$3)', [transfer.rows[0].id, item.product_id, item.quantity]);
      }
    }
    await client.query('COMMIT');
    res.status(201).json({ success: true, data: transfer.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('🔴 CREATE TRANSFER ERROR:', err.message);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};

const validateTransfer = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const transfer = await client.query('SELECT * FROM internal_transfers WHERE id=$1', [id]);
    if (!transfer.rows.length) return res.status(404).json({ success: false, message: 'Transfer not found.' });
    const tr = transfer.rows[0];
    if (tr.status === 'Done') return res.status(400).json({ success: false, message: 'Already validated.' });

    const items = await client.query('SELECT * FROM transfer_items WHERE transfer_id=$1', [id]);
    for (const item of items.rows) {
      await client.query(
        'UPDATE stock SET on_hand=on_hand-$1, free_to_use=free_to_use-$1, updated_at=NOW() WHERE product_id=$2 AND location_id=$3',
        [item.quantity, item.product_id, tr.from_location_id]
      );
      await client.query(`
        INSERT INTO stock (product_id, location_id, on_hand, free_to_use)
        VALUES ($1,$2,$3,$3)
        ON CONFLICT (product_id, location_id)
        DO UPDATE SET on_hand=stock.on_hand+$3, free_to_use=stock.free_to_use+$3, updated_at=NOW()
      `, [item.product_id, tr.to_location_id, item.quantity]);

      await client.query(
        'INSERT INTO move_history (reference, operation_type, from_location, to_location, product_id, quantity, contact, schedule_date, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
        [tr.reference, 'Transfer', tr.from_location_id, tr.to_location_id, item.product_id, item.quantity, tr.responsible, tr.schedule_date, 'Done']
      );
    }

    await client.query('UPDATE internal_transfers SET status=$1 WHERE id=$2', ['Done', id]);
    await client.query('COMMIT');
    res.json({ success: true, message: 'Transfer validated.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('🔴 VALIDATE TRANSFER ERROR:', err.message);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};

// ── MOVE HISTORY ───────────────────────────────────────────
const getMoveHistory = async (req, res) => {
  try {
    const { type, product_id } = req.query;
    let q = `SELECT mh.*, p.name as product_name, p.sku FROM move_history mh LEFT JOIN products p ON p.id=mh.product_id`;
    const params = [], conds = [];
    if (type) { params.push(type); conds.push(`mh.operation_type=$${params.length}`); }
    if (product_id) { params.push(product_id); conds.push(`mh.product_id=$${params.length}`); }
    if (conds.length) q += ' WHERE ' + conds.join(' AND ');
    q += ' ORDER BY mh.created_at DESC LIMIT 200';
    const result = await pool.query(q, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('🔴 MOVE HISTORY ERROR:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── WAREHOUSES & LOCATIONS ─────────────────────────────────
const getWarehouses = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM warehouses ORDER BY name');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('🔴 WAREHOUSES ERROR:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const createWarehouse = async (req, res) => {
  const { name, short_code, address } = req.body;
  try {
    const result = await pool.query('INSERT INTO warehouses (name, short_code, address) VALUES ($1,$2,$3) RETURNING *', [name, short_code, address]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('🔴 CREATE WAREHOUSE ERROR:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getLocations = async (req, res) => {
  try {
    const { warehouse_id } = req.query;
    let q = 'SELECT l.*, w.name as warehouse_name FROM locations l JOIN warehouses w ON w.id=l.warehouse_id';
    const params = [];
    if (warehouse_id) { params.push(warehouse_id); q += ' WHERE l.warehouse_id=$1'; }
    q += ' ORDER BY l.name';
    const result = await pool.query(q, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('🔴 LOCATIONS ERROR:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const createLocation = async (req, res) => {
  const { name, short_code, warehouse_id } = req.body;
  try {
    const result = await pool.query('INSERT INTO locations (name, short_code, warehouse_id) VALUES ($1,$2,$3) RETURNING *', [name, short_code, warehouse_id]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('🔴 CREATE LOCATION ERROR:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getDashboard, getAdjustments, createAdjustment,
  getTransfers, getTransferById, createTransfer, validateTransfer,
  getMoveHistory, getWarehouses, createWarehouse, getLocations, createLocation
};