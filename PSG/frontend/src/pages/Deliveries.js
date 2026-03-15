import React, { useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';

const emptyForm = { delivery_address: '', responsible: '', schedule_date: '', warehouse_id: '', location_id: '', notes: '' };

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const params = filterStatus ? { status: filterStatus } : {};
    API.get('/deliveries', { params }).then(r => { setDeliveries(r.data.data); setLoading(false); });
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    API.get('/products').then(r => setProducts(r.data.data));
    API.get('/warehouses').then(r => setWarehouses(r.data.data));
    API.get('/locations').then(r => setLocations(r.data.data));
  }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const setItem = (i, field, val) => { const u = [...items]; u[i] = { ...u[i], [field]: val }; setItems(u); };

  const save = async () => {
    setSaving(true); setError('');
    try {
      await API.post('/deliveries', { ...form, items: items.filter(i => i.product_id && i.quantity > 0) });
      setShowModal(false);
      setForm(emptyForm);
      setItems([{ product_id: '', quantity: 1 }]);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create delivery.');
    } finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    const msg = status === 'Done' ? 'Validate delivery? Stock will be reduced.' : `Set status to ${status}?`;
    if (!window.confirm(msg)) return;
    try {
      await API.patch(`/deliveries/${id}/status`, { status });
      load();
    } catch (err) { alert(err.response?.data?.message || 'Update failed.'); }
  };

  const viewDetail = async (id) => {
    const r = await API.get(`/deliveries/${id}`);
    setShowDetail(r.data.data);
  };

  const filteredLocs = locations.filter(l => !form.warehouse_id || l.warehouse_id === parseInt(form.warehouse_id));

  const statusFlow = [
    { from: 'Draft', to: 'Waiting', label: '→ Waiting', color: 'var(--warning)' },
    { from: 'Waiting', to: 'Ready', label: '→ Ready', color: 'var(--info)' },
    { from: 'Ready', to: 'Done', label: '✅ Validate', color: 'var(--success)' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Delivery Orders (Outgoing)</h1>
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setItems([{ product_id: '', quantity: 1 }]); setError(''); setShowModal(true); }}>
          + New Delivery
        </button>
      </div>

      <div className="search-row">
        <select className="form-control" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="">All Statuses</option>
          {['Draft', 'Waiting', 'Ready', 'Done', 'Canceled'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? <div className="loading-wrap"><div className="spinner" /></div> : deliveries.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Reference</th><th>Delivery Address</th><th>Warehouse</th><th>Scheduled</th><th>Responsible</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {deliveries.map(d => (
                  <tr key={d.id}>
                    <td><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{d.reference}</span></td>
                    <td>{d.delivery_address || '—'}</td>
                    <td>{d.warehouse_name || '—'}</td>
                    <td className="text-muted text-sm">{d.schedule_date ? new Date(d.schedule_date).toLocaleDateString('en-IN') : '—'}</td>
                    <td>{d.responsible || '—'}</td>
                    <td><StatusBadge status={d.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => viewDetail(d.id)}>👁 View</button>
                        {statusFlow.filter(sf => sf.from === d.status).map(sf => (
                          <button key={sf.to} className="btn btn-ghost btn-sm" style={{ color: sf.color }}
                            onClick={() => updateStatus(d.id, sf.to)}>{sf.label}</button>
                        ))}
                        {d.status !== 'Done' && d.status !== 'Canceled' && (
                          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}
                            onClick={() => updateStatus(d.id, 'Canceled')}>✖ Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state"><div className="icon">📤</div><p>No delivery orders yet.</p></div>
        )}
      </div>

      {showModal && (
        <Modal title="New Delivery Order" onClose={() => setShowModal(false)} size="700px"
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Create Delivery'}</button>
          </>}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Delivery Address</label>
              <input name="delivery_address" className="form-control" value={form.delivery_address} onChange={handle} placeholder="Customer address" />
            </div>
            <div className="form-group">
              <label className="form-label">Responsible</label>
              <input name="responsible" className="form-control" value={form.responsible} onChange={handle} />
            </div>
            <div className="form-group">
              <label className="form-label">Scheduled Date</label>
              <input name="schedule_date" type="date" className="form-control" value={form.schedule_date} onChange={handle} />
            </div>
            <div className="form-group">
              <label className="form-label">Warehouse</label>
              <select name="warehouse_id" className="form-control" value={form.warehouse_id} onChange={handle}>
                <option value="">Select warehouse</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Source Location</label>
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
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <label className="form-label">Products</label>
              <button className="btn btn-ghost btn-sm" onClick={() => setItems([...items, { product_id: '', quantity: 1 }])}>+ Add Row</button>
            </div>
            <table className="items-table">
              <thead><tr><th>Product</th><th>Quantity</th><th></th></tr></thead>
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
                    <td><button className="btn btn-ghost btn-sm" onClick={() => setItems(items.filter((_, j) => j !== i))} style={{ color: 'var(--danger)' }}>✖</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}

      {showDetail && (
        <Modal title={`Delivery: ${showDetail.reference}`} onClose={() => setShowDetail(null)}
          footer={<button className="btn btn-secondary" onClick={() => setShowDetail(null)}>Close</button>}>
          <div className="form-grid">
            {[['Address', showDetail.delivery_address], ['Status', showDetail.status], ['Warehouse', showDetail.warehouse_name], ['Date', showDetail.schedule_date], ['Responsible', showDetail.responsible]].map(([label, val]) => (
              <div key={label}><div className="form-label">{label}</div><div style={{ marginTop: 4 }}>{val || '—'}</div></div>
            ))}
          </div>
          <div>
            <div className="form-label" style={{ marginBottom: 8 }}>Products</div>
            <table className="items-table">
              <thead><tr><th>Product</th><th>SKU</th><th>Quantity</th></tr></thead>
              <tbody>
                {showDetail.items?.map(item => (
                  <tr key={item.id}><td>{item.product_name}</td><td style={{ fontFamily: 'monospace', fontSize: 12 }}>{item.sku}</td><td>{item.quantity}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
}
