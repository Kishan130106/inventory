import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import Modal from '../components/ui/Modal';

export default function Settings() {
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [activeTab, setActiveTab] = useState('warehouses');
  const [showWHModal, setShowWHModal] = useState(false);
  const [showLocModal, setShowLocModal] = useState(false);
  const [whForm, setWhForm] = useState({ name: '', short_code: '', address: '' });
  const [locForm, setLocForm] = useState({ name: '', short_code: '', warehouse_id: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    API.get('/warehouses').then(r => setWarehouses(r.data.data));
    API.get('/locations').then(r => setLocations(r.data.data));
  };
  useEffect(() => { load(); }, []);

  const saveWH = async () => {
    setSaving(true); setError('');
    try {
      await API.post('/warehouses', whForm);
      setShowWHModal(false);
      setWhForm({ name: '', short_code: '', address: '' });
      load();
    } catch (err) { setError(err.response?.data?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const saveLoc = async () => {
    setSaving(true); setError('');
    try {
      await API.post('/locations', locForm);
      setShowLocModal(false);
      setLocForm({ name: '', short_code: '', warehouse_id: '' });
      load();
    } catch (err) { setError(err.response?.data?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const tabs = [
    { key: 'warehouses', label: '🏭 Warehouses' },
    { key: 'locations', label: '📍 Locations' },
  ];

  return (
    <div>
      <div className="page-header"><h1>Settings</h1></div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.key} className={`btn ${activeTab === t.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'warehouses' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Warehouses</div>
            <button className="btn btn-primary btn-sm" onClick={() => { setWhForm({ name: '', short_code: '', address: '' }); setError(''); setShowWHModal(true); }}>
              + Add Warehouse
            </button>
          </div>
          {warehouses.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Name</th><th>Code</th><th>Address</th></tr></thead>
                <tbody>
                  {warehouses.map(w => (
                    <tr key={w.id}>
                      <td><strong>{w.name}</strong></td>
                      <td><span style={{ fontFamily: 'monospace', fontSize: 12, background: 'var(--surface2)', padding: '2px 8px', borderRadius: 4 }}>{w.short_code}</span></td>
                      <td className="text-muted text-sm">{w.address || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="empty-state"><div className="icon">🏭</div><p>No warehouses yet.</p></div>}
        </div>
      )}

      {activeTab === 'locations' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Storage Locations</div>
            <button className="btn btn-primary btn-sm" onClick={() => { setLocForm({ name: '', short_code: '', warehouse_id: '' }); setError(''); setShowLocModal(true); }}>
              + Add Location
            </button>
          </div>
          {locations.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Name</th><th>Code</th><th>Warehouse</th></tr></thead>
                <tbody>
                  {locations.map(l => (
                    <tr key={l.id}>
                      <td><strong>{l.name}</strong></td>
                      <td><span style={{ fontFamily: 'monospace', fontSize: 12, background: 'var(--surface2)', padding: '2px 8px', borderRadius: 4 }}>{l.short_code}</span></td>
                      <td>{l.warehouse_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="empty-state"><div className="icon">📍</div><p>No locations yet.</p></div>}
        </div>
      )}

      {showWHModal && (
        <Modal title="Add Warehouse" onClose={() => setShowWHModal(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowWHModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveWH} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </>}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group"><label className="form-label">Warehouse Name *</label><input className="form-control" value={whForm.name} onChange={e => setWhForm({ ...whForm, name: e.target.value })} required /></div>
          <div className="form-group"><label className="form-label">Short Code *</label><input className="form-control" value={whForm.short_code} onChange={e => setWhForm({ ...whForm, short_code: e.target.value })} placeholder="e.g. WH2" required /></div>
          <div className="form-group"><label className="form-label">Address</label><textarea className="form-control" rows={2} value={whForm.address} onChange={e => setWhForm({ ...whForm, address: e.target.value })} /></div>
        </Modal>
      )}

      {showLocModal && (
        <Modal title="Add Location" onClose={() => setShowLocModal(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowLocModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveLoc} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </>}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group"><label className="form-label">Location Name *</label><input className="form-control" value={locForm.name} onChange={e => setLocForm({ ...locForm, name: e.target.value })} required /></div>
          <div className="form-group"><label className="form-label">Short Code *</label><input className="form-control" value={locForm.short_code} onChange={e => setLocForm({ ...locForm, short_code: e.target.value })} placeholder="e.g. WH-RACK-C" required /></div>
          <div className="form-group">
            <label className="form-label">Warehouse *</label>
            <select className="form-control" value={locForm.warehouse_id} onChange={e => setLocForm({ ...locForm, warehouse_id: e.target.value })}>
              <option value="">Select warehouse</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        </Modal>
      )}
    </div>
  );
}
