import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await login(form.email, form.password);
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
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: 16,
            background: 'var(--accent)', marginBottom: 16,
            fontSize: 28,
          }}>🏏</div>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: 1,
          }}>
            <span style={{ color: 'var(--accent)' }}>PSG</span> Inventory
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4, textTransform: 'uppercase', letterSpacing: 2 }}>
            Patel Sports & Goods
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: 14, padding: '32px 32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: 'var(--text)' }}>Sign In</h2>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input name="email" type="email" className="form-control" placeholder="you@example.com"
                value={form.email} onChange={handle} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input name="password" type="password" className="form-control" placeholder="••••••••"
                value={form.password} onChange={handle} required />
            </div>
            <div style={{ textAlign: 'right', marginTop: -8 }}>
              <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text2)' }}>
            No account?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Register
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
          Default: admin@psg.com / password
        </p>
      </div>
    </div>
  );
}
