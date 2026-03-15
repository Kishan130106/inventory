import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import StatusBadge from '../components/ui/StatusBadge';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/dashboard').then(r => { setData(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;

  const kpis = [
    { label: 'Total Products', value: data?.total_products ?? 0, cls: 'info', icon: '📦' },
    { label: 'Low Stock Items', value: data?.low_stock ?? 0, cls: 'warning', icon: '⚠️' },
    { label: 'Pending Receipts', value: data?.pending_receipts ?? 0, cls: 'accent', icon: '📥' },
    { label: 'Pending Deliveries', value: data?.pending_deliveries ?? 0, cls: 'success', icon: '📤' },
  ];

  const opTypeColor = { Receipt: '#3498db', Delivery: '#e94560', Transfer: '#9b59b6', Adjustment: '#f39c12' };

  return (
    <div>
      {/* KPIs */}
      <div className="kpi-grid">
        {kpis.map(k => (
          <div key={k.label} className={`kpi-card ${k.cls}`}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="card-title">Quick Actions</div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: '+ New Receipt', path: '/receipts', color: '#3498db' },
            { label: '+ New Delivery', path: '/deliveries', color: '#e94560' },
            { label: '+ New Transfer', path: '/transfers', color: '#9b59b6' },
            { label: '+ Add Product', path: '/products', color: '#00b894' },
            { label: 'Stock Adjustment', path: '/adjustments', color: '#f39c12' },
          ].map(a => (
            <button key={a.label} className="btn" onClick={() => navigate(a.path)}
              style={{ background: a.color + '18', color: a.color, border: `1px solid ${a.color}40`, fontWeight: 600 }}>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Move History */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Recent Stock Movements</div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/move-history')}>View All →</button>
        </div>
        {data?.recent_moves?.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Type</th>
                  <th>Product</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_moves.map(m => (
                  <tr key={m.id}>
                    <td><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{m.reference}</span></td>
                    <td>
                      <span style={{
                        background: (opTypeColor[m.operation_type] || '#888') + '18',
                        color: opTypeColor[m.operation_type] || '#888',
                        padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700
                      }}>{m.operation_type}</span>
                    </td>
                    <td>{m.product_name || '—'}</td>
                    <td className="text-muted text-sm">{m.from_location}</td>
                    <td className="text-muted text-sm">{m.to_location}</td>
                    <td><strong>{m.quantity}</strong></td>
                    <td><StatusBadge status={m.status} /></td>
                    <td className="text-muted text-sm">{m.created_at ? new Date(m.created_at).toLocaleDateString('en-IN') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="icon">📋</div>
            <p>No stock movements yet. Start by creating a receipt.</p>
          </div>
        )}
      </div>
    </div>
  );
}
