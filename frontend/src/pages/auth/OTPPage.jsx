// pages/auth/OTPPage.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, KeyRound, Send } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import AuthLayout from '../../layouts/AuthLayout'
import Spinner from '../../components/ui/Spinner'

export default function OTPPage() {
  const { sendOTP, loginWithOTP, loading } = useAuth()
  const [step, setStep]   = useState('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp]     = useState('')

  const handleSendOTP = async (e) => {
    e.preventDefault()
    const ok = await sendOTP(email.trim())
    if (ok) setStep('otp')
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    await loginWithOTP(email.trim(), otp.trim())
  }

  return (
    <AuthLayout>
      <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-medium
                                    dark:text-dark-dim light:text-light-dim
                                    dark:hover:text-dark-text light:hover:text-light-text
                                    mb-8 transition-colors">
        <ArrowLeft size={12} /> Back to login
      </Link>

      {step === 'email' ? (
        <>
          <div className="mb-8">
            <div className="w-11 h-11 rounded-xl bg-gold-500/10 border border-gold-500/25
                            flex items-center justify-center mb-5">
              <Mail size={20} className="text-gold-500" />
            </div>
            <p className="text-xs font-mono dark:text-dark-dim light:text-light-dim tracking-[0.25em] uppercase mb-2">
              Step 1 of 2
            </p>
            <h2 className="font-display font-black text-3xl dark:text-white light:text-light-text tracking-tight">
              Enter your email
            </h2>
            <p className="dark:text-dark-sub light:text-light-sub text-sm mt-2">
              We'll send a 6-digit OTP to your inbox
            </p>
          </div>
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="input-label">Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com" className="input" required autoFocus />
            </div>
            <button type="submit" disabled={loading || !email.trim()} className="btn-primary w-full justify-center">
              {loading ? <Spinner size="sm" /> : <Send size={14} />}
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        </>
      ) : (
        <>
          <div className="mb-8">
            <div className="w-11 h-11 rounded-xl bg-gold-500/10 border border-gold-500/25
                            flex items-center justify-center mb-5">
              <KeyRound size={20} className="text-gold-500" />
            </div>
            <p className="text-xs font-mono dark:text-dark-dim light:text-light-dim tracking-[0.25em] uppercase mb-2">
              Step 2 of 2
            </p>
            <h2 className="font-display font-black text-3xl dark:text-white light:text-light-text tracking-tight">
              Enter OTP
            </h2>
            <p className="dark:text-dark-sub light:text-light-sub text-sm mt-2">
              Sent to <span className="text-gold-500 font-medium">{email}</span>
            </p>
          </div>
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="input-label">6-digit code</label>
              <input type="text" value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="input font-mono text-center text-2xl tracking-[0.5em]"
                maxLength={6} required autoFocus />
            </div>
            <button type="submit" disabled={loading || otp.length < 6} className="btn-primary w-full justify-center">
              {loading ? <Spinner size="sm" /> : <KeyRound size={14} />}
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            <button type="button" onClick={() => { setStep('email'); setOtp('') }}
              className="btn-ghost w-full justify-center dark:text-dark-dim light:text-light-dim">
              Use different email
            </button>
          </form>
          <p className="text-xs dark:text-dark-dim light:text-light-dim text-center mt-4">
            OTP expires in 10 minutes
          </p>
        </>
      )}
    </AuthLayout>
  )
}
