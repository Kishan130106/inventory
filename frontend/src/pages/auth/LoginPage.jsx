// pages/auth/LoginPage.jsx
import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../../hooks/useAuth'
import { useSelector } from 'react-redux'
import { selectIsAuth } from '../../store/authSlice'
import Spinner from '../../components/ui/Spinner'
import AuthLayout from '../../layouts/AuthLayout'

export default function LoginPage() {
  const { loginWithGoogle, loading } = useAuth()
  const isAuth  = useSelector(selectIsAuth)
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuth) navigate('/dashboard', { replace: true })
  }, [isAuth, navigate])

  return (
    <AuthLayout>
      <div className="mb-8">
        <p className="text-xs font-mono dark:text-dark-dim light:text-light-dim tracking-[0.25em] uppercase mb-3">
          Welcome back
        </p>
        <h2 className="font-display font-black text-3xl dark:text-white light:text-light-text tracking-tight leading-none">
          Sign in to PSG
        </h2>
        <p className="dark:text-dark-sub light:text-light-sub text-sm mt-2">
          Access your inventory dashboard
        </p>
      </div>

      <div className="mb-5">
        <p className="input-label mb-3">Continue with Google</p>
        {loading ? (
          <div className="flex items-center justify-center h-11">
            <Spinner size="sm" />
          </div>
        ) : (
          <div className="[&>div]:w-full">
            <GoogleLogin
              onSuccess={(res) => loginWithGoogle(res.credential)}
              onError={() => {}}
              theme="filled_black"
              size="large"
              shape="rectangular"
              width="100%"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px dark:bg-dark-border light:bg-light-border" />
        <span className="text-xs dark:text-dark-dim light:text-light-dim font-mono">OR</span>
        <div className="flex-1 h-px dark:bg-dark-border light:bg-light-border" />
      </div>

      <Link to="/otp" className="btn-secondary w-full justify-center mb-8">
        Login with Email OTP
      </Link>

      <p className="text-xs dark:text-dark-dim light:text-light-dim text-center leading-relaxed">
        PSG internal system only.<br />
        Unauthorized access is prohibited.
      </p>
    </AuthLayout>
  )
}
