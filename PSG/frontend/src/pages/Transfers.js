import React, { useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';

export default function Transfers() {
  const [transfers, setTransfers] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState({ from_location_id: '', to_location_id: '', responsible: '', schedule_date: '', notes: '' });
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    API.get('/transfers').then(r => { setTransfers(r.data.data); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    API.get('/products').then(r => setProducts(r.data.data));
    API.get('/locations').then(r => setLocations(r.data.data));
  }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const setItem = (i, field, val) => { const u = [...items]; u[i] = { ...u[i], [field]: val }; setItems(u); };

  const save = async () => {
    if (form.from_location_id === form.to_location_id) { setError('Source and destination cannot be the same.'); return; }
    setSaving(true); setError('');
    try {
      await API.post('/transfers', { ...form, items: items.filter(i => i.product_id && i.quantity > 0) });
      setShowModal(false);
      setForm({ from_location_id: '', to_location_id: '', responsible: '', schedule_date: '', notes: '' });
      setItems([{ product_id: '', quantity: 1 }]);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed.');
    } finally { setSaving(false); }
  };

  const validate = async (id) => {
    if (!window.confirm('Validate transfer? Stock will be moved between locations.')) return;
    try {
      await API.patch(`/transfers/${id}/validate`);
      load();
    } catch (err) { alert(err.response?.data?.message || 'Validation failed.'); }
  };

  const viewDetail = async (id) => {
    const r = await API.get(`/transfers/${id}`);
    setShowDetail(r.data.data);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Internal Transfers</h1>
        <button className="btn btn-primary" onClick={() => { setForm({ from_location_id: '', to_location_id: '', responsible: '', schedule_date: '', notes: '' }); setItems([{ product_id: '', quantity: 1 }]); setError(''); setShowModal(true); }}>
          + New Transfer
        </button>
      </div>

      <div className="card">
        {loading ? <div className="loading-wrap"><div className="spinner" /></div> : transfers.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Reference</th><th>From</th><th>To</th><th>Responsible</th><th>Scheduled</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {transfers.map(t => (
                  <tr key={t.id}>
                    <td><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{t.reference}</span></td>
                    <td>
                      <span style={{ background: 'var(--accent-soft)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 10, fontSize: 12, fontWeight: 600 }}>
                        {t.from_location_name || '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ background: 'var(--success-soft)', color: 'var(--success)', padding: '2px 8px', borderRadius: 10, fontSize: 12, fontWeight: 600 }}>
                        {t.to_location_name || '—'}
                      </span>
                    </td>
                    <td>{t.responsible || '—'}</td>
                    <td className="text-muted text-sm">{t.schedule_date ? new Date(t.schedule_date).toLocaleDateString('en-IN') : '—'}</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => viewDetail(t.id)}>👁 View</button>
                        {t.status !== 'Done' && (
                          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--success)' }} onClick={() => validate(t.id)}>✅ Validate</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state"><div className="icon">🔄</div><p>No transfers yet.</p></div>
        )}
      </div>

      {showModal && (
        <Modal title="New Internal Transfer" onClose={() => setShowModal(false)} size="680px"
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Create Transfer'}</button>
          </>}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">From Location *</label>
              <select name="from_location_id" className="form-control" value={form.from_location_id} onChange={handle}>
                <option value="">Select source</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.warehouse_name})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">To Location *</label>
              <select name="to_location_id" className="form-control" value={form.to_location_id} onChange={handle}>
                <option value="">Select destination</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.warehouse_name})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Responsible</label>
              <input name="responsible" className="form-control" value={form.responsible} onChange={handle} />
            </div>
            <div className="form-group">
              <label className="form-label">Scheduled Date</label>
              <input name="schedule_date" type="date" className="form-control" value={form.schedule_date} onChange={handle} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea name="notes" className="form-control" rows={2} value={form.notes} onChange={handle} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <label className="form-label">Products to Transfer</label>
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
                    <td><input type="number" className="form-control" min={1} value={item.quantity} onChange={e => setItem(i, 'quantity', parseInt(e.target.value))} style={{ width: 80 }} /></td>
                    <td><button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => setItems(items.filter((_, j) => j !== i))}>✖</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}

      {showDetail && (
        <Modal title={`Transfer: ${showDetail.reference}`} onClose={() => setShowDetail(null)}
          footer={<button className="btn btn-secondary" onClick={() => setShowDetail(null)}>Close</button>}>
          <div className="form-grid">
            {[['From', showDetail.from_location_name], ['To', showDetail.to_location_name], ['Status', showDetail.status], ['Date', showDetail.schedule_date], ['Responsible', showDetail.responsible]].map(([label, val]) => (
              <div key={label}><div className="form-label">{label}</div><div style={{ marginTop: 4 }}>{val || '—'}</div></div>
            ))}
          </div>
          <div>
            <div className="form-label" style={{ marginBottom: 8 }}>Products</div>
            <table className="items-table">
              <thead><tr><th>Product</th><th>SKU</th><th>Quantity</th></tr></thead>
              <tbody>
                {showDetail.items?.map(i => (
                  <tr key={i.id}><td>{i.product_name}</td><td style={{ fontFamily: 'monospace', fontSize: 12 }}>{i.sku}</td><td>{i.quantity}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
}
