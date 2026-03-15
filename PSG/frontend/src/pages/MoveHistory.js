import React, { useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import StatusBadge from '../components/ui/StatusBadge';

export default function MoveHistory() {
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [products, setProducts] = useState([]);

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (filterType) params.type = filterType;
    if (filterProduct) params.product_id = filterProduct;
    API.get('/move-history', { params }).then(r => { setMoves(r.data.data); setLoading(false); });
  }, [filterType, filterProduct]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { API.get('/products').then(r => setProducts(r.data.data)); }, []);

  const typeColors = {
    Receipt: '#3498db',
    Delivery: '#e94560',
    Transfer: '#9b59b6',
    Adjustment: '#f39c12',
  };

  return (
    <div>
      <div className="page-header">
        <h1>Move History</h1>
        <span className="text-muted text-sm">{moves.length} records</span>
      </div>

      <div className="search-row">
        <select className="form-control" value={filterType} onChange={e => setFilterType(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="">All Operations</option>
          {['Receipt', 'Delivery', 'Transfer', 'Adjustment'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="form-control" value={filterProduct} onChange={e => setFilterProduct(e.target.value)} style={{ maxWidth: 240 }}>
          <option value="">All Products</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button className="btn btn-secondary btn-sm" onClick={() => { setFilterType(''); setFilterProduct(''); }}>Clear</button>
      </div>

      <div className="card">
        {loading ? <div className="loading-wrap"><div className="spinner" /></div> : moves.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Type</th>
                  <th>Product</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Quantity</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {moves.map(m => (
                  <tr key={m.id}>
                    <td><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{m.reference}</span></td>
                    <td>
                      <span style={{
                        background: (typeColors[m.operation_type] || '#888') + '18',
                        color: typeColors[m.operation_type] || '#888',
                        padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700
                      }}>{m.operation_type}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{m.product_name || '—'}</div>
                      <div className="text-muted text-sm">{m.sku}</div>
                    </td>
                    <td className="text-muted text-sm">{m.from_location}</td>
                    <td className="text-muted text-sm">{m.to_location}</td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        color: m.operation_type === 'Delivery' ? 'var(--danger)' : m.operation_type === 'Receipt' ? 'var(--success)' : 'var(--text)'
                      }}>
                        {m.operation_type === 'Delivery' ? '−' : m.operation_type === 'Receipt' ? '+' : ''}{Math.abs(m.quantity)}
                      </span>
                    </td>
                    <td className="text-muted text-sm">{m.contact || '—'}</td>
                    <td><StatusBadge status={m.status} /></td>
                    <td className="text-muted text-sm">{new Date(m.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state"><div className="icon">📋</div><p>No stock movements recorded.</p></div>
        )}
      </div>
    </div>
  );
}
