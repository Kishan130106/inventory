import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await register(form);
    setLoading(false);
    if (res.success) navigate('/dashboard');
    else setError(res.message);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 26, fontWeight: 700, color: '#fff',
          }}>
            <span style={{ color: 'var(--accent)' }}>PSG</span> Inventory
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>Create Your Account</div>
        </div>

        <div style={{ background: '#fff', borderRadius: 14, padding: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Register</h2>
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input name="first_name" className="form-control" placeholder="Shubham"
                  value={form.first_name} onChange={handle} required />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input name="last_name" className="form-control" placeholder="Patel"
                  value={form.last_name} onChange={handle} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input name="email" type="email" className="form-control" placeholder="you@psg.com"
                value={form.email} onChange={handle} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input name="password" type="password" className="form-control" placeholder="Min 6 characters"
                value={form.password} onChange={handle} minLength={6} required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text2)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
