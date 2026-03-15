const pool = require('../config/db');

const generateRef = async () => {
  const result = await pool.query("SELECT reference FROM deliveries ORDER BY id DESC LIMIT 1");
  if (!result.rows.length) return 'WH/OUT/0001';
  const last = result.rows[0].reference;
  const num = parseInt(last.split('/')[2]) + 1;
  return `WH/OUT/${String(num).padStart(4, '0')}`;
};

const getAll = async (req, res) => {
  try {
    const { status } = req.query;
    let q = 'SELECT d.*, w.name as warehouse_name FROM deliveries d LEFT JOIN warehouses w ON w.id=d.warehouse_id';
    const params = [];
    if (status) { params.push(status); q += ` WHERE d.status=$1`; }
    q += ' ORDER BY d.created_at DESC';
    const result = await pool.query(q, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const delivery = await pool.query('SELECT d.*, w.name as warehouse_name FROM deliveries d LEFT JOIN warehouses w ON w.id=d.warehouse_id WHERE d.id=$1', [req.params.id]);
    if (!delivery.rows.length) return res.status(404).json({ success: false, message: 'Delivery not found.' });
    const items = await pool.query(
      'SELECT di.*, p.name as product_name, p.sku FROM delivery_items di JOIN products p ON p.id=di.product_id WHERE di.delivery_id=$1',
      [req.params.id]
    );
    res.json({ success: true, data: { ...delivery.rows[0], items: items.rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  const { delivery_address, responsible, schedule_date, warehouse_id, location_id, notes, items } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const reference = await generateRef();
    const delivery = await client.query(
      'INSERT INTO deliveries (reference, delivery_address, responsible, schedule_date, warehouse_id, location_id, notes, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [reference, delivery_address, responsible, schedule_date, warehouse_id, location_id, notes, 'Draft']
    );
    const deliveryId = delivery.rows[0].id;
    if (items && items.length) {
      for (const item of items) {
        await client.query('INSERT INTO delivery_items (delivery_id, product_id, quantity) VALUES ($1,$2,$3)', [deliveryId, item.product_id, item.quantity]);
      }
    }
    await client.query('COMMIT');
    res.status(201).json({ success: true, data: delivery.rows[0] });
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
    const delivery = await client.query('SELECT * FROM deliveries WHERE id=$1', [id]);
    if (!delivery.rows.length) return res.status(404).json({ success: false, message: 'Delivery not found.' });
    const del = delivery.rows[0];

    if (status === 'Done' && del.status !== 'Done') {
      const items = await client.query('SELECT * FROM delivery_items WHERE delivery_id=$1', [id]);
      for (const item of items.rows) {
        // Check sufficient stock
        const stockCheck = await client.query(
          'SELECT on_hand FROM stock WHERE product_id=$1 AND location_id=$2',
          [item.product_id, del.location_id]
        );
        if (!stockCheck.rows.length || stockCheck.rows[0].on_hand < item.quantity) {
          await client.query('ROLLBACK');
          return res.status(400).json({ success: false, message: `Insufficient stock for product ID ${item.product_id}` });
        }

        await client.query(
          'UPDATE stock SET on_hand=on_hand-$1, free_to_use=free_to_use-$1, updated_at=NOW() WHERE product_id=$2 AND location_id=$3',
          [item.quantity, item.product_id, del.location_id]
        );

        await client.query(
          'INSERT INTO move_history (reference, operation_type, from_location, to_location, product_id, quantity, contact, schedule_date, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
          [del.reference, 'Delivery', 'Warehouse', del.delivery_address || 'Customer', item.product_id, item.quantity, del.responsible, del.schedule_date, 'Done']
        );
      }
    }

    await client.query('UPDATE deliveries SET status=$1 WHERE id=$2', [status, id]);
    await client.query('COMMIT');
    res.json({ success: true, message: `Delivery updated to ${status}` });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const { delivery_address, responsible, schedule_date, warehouse_id, location_id, notes, items } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'UPDATE deliveries SET delivery_address=$1, responsible=$2, schedule_date=$3, warehouse_id=$4, location_id=$5, notes=$6 WHERE id=$7',
      [delivery_address, responsible, schedule_date, warehouse_id, location_id, notes, id]
    );
    if (items) {
      await client.query('DELETE FROM delivery_items WHERE delivery_id=$1', [id]);
      for (const item of items) {
        await client.query('INSERT INTO delivery_items (delivery_id, product_id, quantity) VALUES ($1,$2,$3)', [id, item.product_id, item.quantity]);
      }
    }
    await client.query('COMMIT');
    res.json({ success: true, message: 'Delivery updated.' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};

module.exports = { getAll, getById, create, update, updateStatus };
