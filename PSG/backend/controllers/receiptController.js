const pool = require('../config/db');

const generateRef = async () => {
  const result = await pool.query("SELECT reference FROM receipts ORDER BY id DESC LIMIT 1");
  if (!result.rows.length) return 'WH/IN/0001';
  const last = result.rows[0].reference;
  const num = parseInt(last.split('/')[2]) + 1;
  return `WH/IN/${String(num).padStart(4, '0')}`;
};

const getAll = async (req, res) => {
  try {
    const { status, warehouse_id } = req.query;
    let q = 'SELECT r.*, w.name as warehouse_name FROM receipts r LEFT JOIN warehouses w ON w.id=r.warehouse_id';
    const params = [], conditions = [];
    if (status) { params.push(status); conditions.push(`r.status=$${params.length}`); }
    if (warehouse_id) { params.push(warehouse_id); conditions.push(`r.warehouse_id=$${params.length}`); }
    if (conditions.length) q += ' WHERE ' + conditions.join(' AND ');
    q += ' ORDER BY r.created_at DESC';
    const result = await pool.query(q, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const receipt = await pool.query('SELECT r.*, w.name as warehouse_name FROM receipts r LEFT JOIN warehouses w ON w.id=r.warehouse_id WHERE r.id=$1', [req.params.id]);
    if (!receipt.rows.length) return res.status(404).json({ success: false, message: 'Receipt not found.' });
    const items = await pool.query(
      'SELECT ri.*, p.name as product_name, p.sku FROM receipt_items ri JOIN products p ON p.id=ri.product_id WHERE ri.receipt_id=$1',
      [req.params.id]
    );
    res.json({ success: true, data: { ...receipt.rows[0], items: items.rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  const { supplier, schedule_date, responsible, warehouse_id, location_id, notes, items } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const reference = await generateRef();
    const receipt = await client.query(
      'INSERT INTO receipts (reference, supplier, schedule_date, responsible, warehouse_id, location_id, notes, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [reference, supplier, schedule_date, responsible, warehouse_id, location_id, notes, 'Draft']
    );
    const receiptId = receipt.rows[0].id;
    if (items && items.length) {
      for (const item of items) {
        await client.query(
          'INSERT INTO receipt_items (receipt_id, product_id, quantity, unit_cost) VALUES ($1,$2,$3,$4)',
          [receiptId, item.product_id, item.quantity, item.unit_cost || 0]
        );
      }
    }
    await client.query('COMMIT');
    res.status(201).json({ success: true, data: receipt.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};

const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const receipt = await client.query('SELECT * FROM receipts WHERE id=$1', [id]);
    if (!receipt.rows.length) return res.status(404).json({ success: false, message: 'Receipt not found.' });
    const rec = receipt.rows[0];

    // When validating, increase stock
    if (status === 'Done' && rec.status !== 'Done') {
      const items = await client.query('SELECT * FROM receipt_items WHERE receipt_id=$1', [id]);
      for (const item of items.rows) {
        await client.query(`
          INSERT INTO stock (product_id, location_id, on_hand, free_to_use)
          VALUES ($1, $2, $3, $3)
          ON CONFLICT (product_id, location_id)
          DO UPDATE SET on_hand = stock.on_hand + $3, free_to_use = stock.free_to_use + $3, updated_at = NOW()
        `, [item.product_id, rec.location_id, item.quantity]);

        await client.query(
          'INSERT INTO move_history (reference, operation_type, from_location, to_location, product_id, quantity, contact, schedule_date, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
          [rec.reference, 'Receipt', 'Supplier', 'Warehouse', item.product_id, item.quantity, rec.supplier, rec.schedule_date, 'Done']
        );
      }
    }

    await client.query('UPDATE receipts SET status=$1 WHERE id=$2', [status, id]);
    await client.query('COMMIT');
    res.json({ success: true, message: `Receipt updated to ${status}` });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const { supplier, schedule_date, responsible, warehouse_id, location_id, notes, items } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'UPDATE receipts SET supplier=$1, schedule_date=$2, responsible=$3, warehouse_id=$4, location_id=$5, notes=$6 WHERE id=$7',
      [supplier, schedule_date, responsible, warehouse_id, location_id, notes, id]
    );
    if (items) {
      await client.query('DELETE FROM receipt_items WHERE receipt_id=$1', [id]);
      for (const item of items) {
        await client.query('INSERT INTO receipt_items (receipt_id, product_id, quantity, unit_cost) VALUES ($1,$2,$3,$4)', [id, item.product_id, item.quantity, item.unit_cost || 0]);
      }
    }
    await client.query('COMMIT');
    res.json({ success: true, message: 'Receipt updated.' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};

module.exports = { getAll, getById, create, update, updateStatus };
