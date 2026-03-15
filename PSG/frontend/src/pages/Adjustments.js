import React, { useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import Modal from '../components/ui/Modal';

export default function Adjustments() {
  const [adjustments, setAdjustments] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ product_id: '', location_id: '', new_quantity: '', reason: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [currentStock, setCurrentStock] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    API.get('/adjustments').then(r => { setAdjustments(r.data.data); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    API.get('/products').then(r => setProducts(r.data.data));
    API.get('/locations').then(r => setLocations(r.data.data));
  }, []);

  const handle = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);
    // Try to show current stock
    if (updated.product_id && updated.location_id) {
      API.get(`/products/${updated.product_id}`).then(r => {
        const stock = r.data.data.stock?.find(s => s.location_id === parseInt(updated.location_id));
        setCurrentStock(stock?.on_hand ?? 0);
      });
    }
  };

  const save = async () => {
    setSaving(true); setError('');
    try {
      await API.post('/adjustments', { ...form, new_quantity: parseInt(form.new_quantity) });
      setShowModal(false);
      setForm({ product_id: '', location_id: '', new_quantity: '', reason: '' });
      setCurrentStock(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Adjustment failed.');
    } finally { setSaving(false); }
  };

  const diff = form.new_quantity !== '' && currentStock !== null
    ? parseInt(form.new_quantity) - currentStock
    : null;

  return (
    <div>
      <div className="page-header">
        <h1>Stock Adjustments</h1>
        <button className="btn btn-primary" onClick={() => { setForm({ product_id: '', location_id: '', new_quantity: '', reason: '' }); setCurrentStock(null); setError(''); setShowModal(true); }}>
          + New Adjustment
        </button>
      </div>

      <div className="card">
        {loading ? <div className="loading-wrap"><div className="spinner" /></div> : adjustments.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Reference</th><th>Product</th><th>Location</th><th>Old Qty</th><th>New Qty</th><th>Change</th><th>Reason</th><th>Adjusted By</th><th>Date</th></tr>
              </thead>
              <tbody>
                {adjustments.map(a => {
                  const change = a.new_quantity - a.old_quantity;
                  return (
                    <tr key={a.id}>
                      <td><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{a.reference}</span></td>
                      <td><div style={{ fontWeight: 600 }}>{a.product_name}</div><div className="text-muted text-sm">{a.sku}</div></td>
                      <td>{a.location_name}</td>
                      <td>{a.old_quantity}</td>
                      <td><strong>{a.new_quantity}</strong></td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: change > 0 ? 'var(--success)' : change < 0 ? 'var(--danger)' : 'var(--text2)'
                        }}>
                          {change > 0 ? '+' : ''}{change}
                        </span>
                      </td>
                      <td className="text-muted text-sm">{a.reason || '—'}</td>
                      <td className="text-muted text-sm">{a.adjusted_by}</td>
                      <td className="text-muted text-sm">{new Date(a.created_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state"><div className="icon">⚖️</div><p>No stock adjustments yet.</p></div>
        )}
      </div>

      {showModal && (
        <Modal title="New Stock Adjustment" onClose={() => setShowModal(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Apply Adjustment'}</button>
          </>}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Product *</label>
            <select name="product_id" className="form-control" value={form.product_id} onChange={handle}>
              <option value="">Select product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Location *</label>
            <select name="location_id" className="form-control" value={form.location_id} onChange={handle}>
              <option value="">Select location</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.warehouse_name})</option>)}
            </select>
          </div>

          {currentStock !== null && (
            <div style={{ background: 'var(--info-soft)', border: '1px solid var(--info)30', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
              <strong>Current stock at this location:</strong> {currentStock} units
            </div>
          )}

          <div className="form-group">
            <label className="form-label">New (Physical Count) Quantity *</label>
            <input name="new_quantity" type="number" min={0} className="form-control" value={form.new_quantity} onChange={handle} placeholder="Enter actual counted quantity" />
          </div>

          {diff !== null && (
            <div style={{
              background: diff > 0 ? 'var(--success-soft)' : diff < 0 ? 'var(--danger-soft)' : 'var(--surface2)',
              border: `1px solid ${diff > 0 ? 'var(--success)' : diff < 0 ? 'var(--danger)' : 'var(--border)'}30`,
              borderRadius: 8, padding: '10px 14px', fontSize: 13,
              color: diff > 0 ? 'var(--success)' : diff < 0 ? 'var(--danger)' : 'var(--text2)',
            }}>
              <strong>Stock change:</strong> {diff > 0 ? '+' : ''}{diff} units
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Reason</label>
            <select name="reason" className="form-control" value={form.reason} onChange={handle}>
              <option value="">Select reason</option>
              <option value="Physical count correction">Physical count correction</option>
              <option value="Damaged goods">Damaged goods</option>
              <option value="Theft / Loss">Theft / Loss</option>
              <option value="Expired products">Expired products</option>
              <option value="Data entry correction">Data entry correction</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </Modal>
      )}
    </div>
  );
}
