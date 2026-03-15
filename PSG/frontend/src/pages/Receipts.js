import React, { useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';

const emptyForm = { supplier: '', schedule_date: '', responsible: '', warehouse_id: '', location_id: '', notes: '' };

export default function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState([{ product_id: '', quantity: 1, unit_cost: 0 }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const params = filterStatus ? { status: filterStatus } : {};
    API.get('/receipts', { params }).then(r => { setReceipts(r.data.data); setLoading(false); });
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    API.get('/products').then(r => setProducts(r.data.data));
    API.get('/warehouses').then(r => setWarehouses(r.data.data));
    API.get('/locations').then(r => setLocations(r.data.data));
  }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const setItem = (i, field, val) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: val };
    setItems(updated);
  };

  const save = async () => {
    setSaving(true); setError('');
    try {
      await API.post('/receipts', { ...form, items: items.filter(i => i.product_id && i.quantity > 0) });
      setShowModal(false);
      setForm(emptyForm);
      setItems([{ product_id: '', quantity: 1, unit_cost: 0 }]);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create receipt.');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id, status) => {
    if (status === 'Done' && !window.confirm('Validate this receipt? Stock will be increased.')) return;
    try {
      await API.patch(`/receipts/${id}/status`, { status });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed.');
    }
  };

  const viewDetail = async (id) => {
    const r = await API.get(`/receipts/${id}`);
    setShowDetail(r.data.data);
  };

  const filteredLocs = locations.filter(l => !form.warehouse_id || l.warehouse_id === parseInt(form.warehouse_id));

  return (
    <div>
      <div className="page-header">
        <h1>Receipts (Incoming)</h1>
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setItems([{ product_id: '', quantity: 1, unit_cost: 0 }]); setError(''); setShowModal(true); }}>
          + New Receipt
        </button>
      </div>

      <div className="search-row">
        <select className="form-control" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="">All Statuses</option>
          {['Draft', 'Waiting', 'Ready', 'Done', 'Canceled'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? <div className="loading-wrap"><div className="spinner" /></div> : receipts.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Reference</th><th>Supplier</th><th>Warehouse</th><th>Scheduled</th><th>Responsible</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {receipts.map(r => (
                  <tr key={r.id}>
                    <td><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.reference}</span></td>
                    <td>{r.supplier || '—'}</td>
                    <td>{r.warehouse_name || '—'}</td>
                    <td className="text-muted text-sm">{r.schedule_date ? new Date(r.schedule_date).toLocaleDateString('en-IN') : '—'}</td>
                    <td>{r.responsible || '—'}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => viewDetail(r.id)}>👁 View</button>
                        {r.status !== 'Done' && r.status !== 'Canceled' && (
                          <>
                            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--success)' }}
                              onClick={() => updateStatus(r.id, 'Done')}>✅ Validate</button>
                            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}
                              onClick={() => updateStatus(r.id, 'Canceled')}>✖</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state"><div className="icon">📥</div><p>No receipts yet.</p></div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <Modal title="New Receipt" onClose={() => setShowModal(false)} size="700px"
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Create Receipt'}</button>
          </>}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Supplier</label>
              <input name="supplier" className="form-control" value={form.supplier} onChange={handle} placeholder="Supplier name" />
            </div>
            <div className="form-group">
              <label className="form-label">Scheduled Date</label>
              <input name="schedule_date" type="date" className="form-control" value={form.schedule_date} onChange={handle} />
            </div>
            <div className="form-group">
              <label className="form-label">Responsible</label>
              <input name="responsible" className="form-control" value={form.responsible} onChange={handle} />
            </div>
            <div className="form-group">
              <label className="form-label">Warehouse</label>
              <select name="warehouse_id" className="form-control" value={form.warehouse_id} onChange={handle}>
                <option value="">Select warehouse</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Destination Location</label>
              <select name="location_id" className="form-control" value={form.location_id} onChange={handle}>
                <option value="">Select location</option>
                {filteredLocs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea name="notes" className="form-control" rows={2} value={form.notes} onChange={handle} />
          </div>

          {/* Items */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className="form-label">Products</label>
              <button className="btn btn-ghost btn-sm" onClick={() => setItems([...items, { product_id: '', quantity: 1, unit_cost: 0 }])}>+ Add Row</button>
            </div>
            <table className="items-table">
              <thead><tr><th>Product</th><th>Qty</th><th>Unit Cost</th><th></th></tr></thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td>
                      <select className="form-control" value={item.product_id} onChange={e => setItem(i, 'product_id', e.target.value)}>
                        <option value="">Select product</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                      </select>
                    </td>
                    <td><input type="number" className="form-control" value={item.quantity} min={1} onChange={e => setItem(i, 'quantity', parseInt(e.target.value))} style={{ width: 80 }} /></td>
                    <td><input type="number" step="0.01" className="form-control" value={item.unit_cost} onChange={e => setItem(i, 'unit_cost', parseFloat(e.target.value))} style={{ width: 100 }} /></td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => setItems(items.filter((_, j) => j !== i))} style={{ color: 'var(--danger)' }}>✖</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <Modal title={`Receipt: ${showDetail.reference}`} onClose={() => setShowDetail(null)}
          footer={<button className="btn btn-secondary" onClick={() => setShowDetail(null)}>Close</button>}>
          <div className="form-grid">
            {[['Supplier', showDetail.supplier], ['Status', showDetail.status], ['Warehouse', showDetail.warehouse_name], ['Date', showDetail.schedule_date], ['Responsible', showDetail.responsible]].map(([label, val]) => (
              <div key={label}>
                <div className="form-label">{label}</div>
                <div style={{ marginTop: 4 }}>{val || '—'}</div>
              </div>
            ))}
          </div>
          {showDetail.notes && <div><div className="form-label">Notes</div><div style={{ marginTop: 4 }}>{showDetail.notes}</div></div>}
          <div>
            <div className="form-label" style={{ marginBottom: 8 }}>Products</div>
            <table className="items-table">
              <thead><tr><th>Product</th><th>SKU</th><th>Quantity</th><th>Unit Cost</th></tr></thead>
              <tbody>
                {showDetail.items?.map(item => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{item.sku}</td>
                    <td>{item.quantity}</td>
                    <td>₹{parseFloat(item.unit_cost || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
}
