import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await API.post('/auth/send-otp', { email });
      setSuccess('OTP sent! Check your email (or server console in dev).');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await API.post('/auth/reset-password', { email, otp, new_password: newPassword });
      setSuccess('Password reset! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)', padding: 20,
  };

  return (
    <div style={cardStyle}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 700, color: '#fff' }}>
            <span style={{ color: 'var(--accent)' }}>PSG</span> Inventory
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>Password Reset</div>
        </div>

        <div style={{ background: '#fff', borderRadius: 14, padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
            {step === 1 ? 'Forgot Password' : 'Enter OTP & New Password'}
          </h2>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {step === 1 ? (
            <form onSubmit={sendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" placeholder="your@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}
                style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={resetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">OTP Code</label>
                <input className="form-control" placeholder="6-digit OTP"
                  value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="form-control" placeholder="Min 6 characters"
                  value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={6} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}
                style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text2)' }}>
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>← Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
