import React, { useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import Modal from '../components/ui/Modal';

const emptyForm = { name: '', sku: '', category: '', unit_of_measure: 'pcs', unit_cost: '', description: '', reorder_level: 10 };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (filterCat) params.category = filterCat;
    API.get('/products', { params }).then(r => { setProducts(r.data.data); setLoading(false); });
  }, [search, filterCat]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { API.get('/products/categories').then(r => setCategories(r.data.data)); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(''); setShowModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name, sku: p.sku, category: p.category || '', unit_of_measure: p.unit_of_measure || 'pcs', unit_cost: p.unit_cost || '', description: p.description || '', reorder_level: p.reorder_level || 10 }); setError(''); setShowModal(true); };

  const save = async () => {
    setSaving(true); setError('');
    try {
      if (editing) await API.put(`/products/${editing.id}`, form);
      else await API.post('/products', form);
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await API.delete(`/products/${id}`);
    load();
  };

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Product</button>
      </div>

      <div className="search-row">
        <input className="form-control" placeholder="Search by name or SKU..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        <select className="form-control" value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? <div className="loading-wrap"><div className="spinner" /></div> : products.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>UOM</th>
                  <th>Unit Cost</th>
                  <th>Total Stock</th>
                  <th>Reorder At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      {p.description && <div className="text-muted text-sm">{p.description.substring(0, 40)}{p.description.length > 40 ? '…' : ''}</div>}
                    </td>
                    <td><span style={{ fontFamily: 'monospace', fontSize: 12, background: 'var(--surface2)', padding: '2px 6px', borderRadius: 4 }}>{p.sku}</span></td>
                    <td>{p.category || <span className="text-muted">—</span>}</td>
                    <td>{p.unit_of_measure}</td>
                    <td>₹{parseFloat(p.unit_cost || 0).toFixed(2)}</td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        color: parseInt(p.total_stock) <= parseInt(p.reorder_level) ? 'var(--warning)' : 'var(--success)'
                      }}>
                        {p.total_stock ?? 0}
                      </span>
                    </td>
                    <td>{p.reorder_level}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>✏️</button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => del(p.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="icon">📦</div>
            <p>No products found. Add your first product!</p>
          </div>
        )}
      </div>

      {showModal && (
        <Modal
          title={editing ? 'Edit Product' : 'Add New Product'}
          onClose={() => setShowModal(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</button>
          </>}
        >
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input name="name" className="form-control" value={form.name} onChange={handle} required placeholder="e.g. Cricket Bat" />
            </div>
            <div className="form-group">
              <label className="form-label">SKU / Code *</label>
              <input name="sku" className="form-control" value={form.sku} onChange={handle} required placeholder="e.g. PSG-CB-001" />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input name="category" className="form-control" value={form.category} onChange={handle} placeholder="e.g. Cricket, Football" list="cat-list" />
              <datalist id="cat-list">{categories.map(c => <option key={c} value={c} />)}</datalist>
            </div>
            <div className="form-group">
              <label className="form-label">Unit of Measure</label>
              <select name="unit_of_measure" className="form-control" value={form.unit_of_measure} onChange={handle}>
                {['pcs', 'kg', 'g', 'l', 'ml', 'box', 'pair', 'set', 'dozen'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Unit Cost (₹)</label>
              <input name="unit_cost" type="number" step="0.01" className="form-control" value={form.unit_cost} onChange={handle} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label className="form-label">Reorder Level</label>
              <input name="reorder_level" type="number" className="form-control" value={form.reorder_level} onChange={handle} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" className="form-control" rows={2} value={form.description} onChange={handle} placeholder="Optional description..." />
          </div>
        </Modal>
      )}
    </div>
  );
}
