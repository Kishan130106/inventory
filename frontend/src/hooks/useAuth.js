// hooks/useAuth.js
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { setCredentials, setLoading, setError, logout, selectUser, selectIsAuth, selectLoading } from '../store/authSlice'
import * as authApi from '../api/auth'

export const useAuth = () => {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const user      = useSelector(selectUser)
  const isAuth    = useSelector(selectIsAuth)
  const loading   = useSelector(selectLoading)

  const loginWithGoogle = async (credential) => {
    dispatch(setLoading(true))
    try {
      const { data } = await authApi.googleLogin(credential)
      dispatch(setCredentials({ token: data.token, user: data.user }))
      toast.success(`Welcome back, ${data.user.name?.split(' ')[0]}!`)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.error || 'Google login failed.'
      dispatch(setError(msg))
      toast.error(msg)
    }
  }

  const sendOTP = async (email) => {
    dispatch(setLoading(true))
    try {
      await authApi.requestOTP(email)
      dispatch(setLoading(false))
      toast.success('OTP sent to your email.')
      return true
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to send OTP.'
      dispatch(setError(msg))
      toast.error(msg)
      return false
    }
  }

  const loginWithOTP = async (email, otp) => {
    dispatch(setLoading(true))
    try {
      const { data } = await authApi.verifyOTP(email, otp)
      dispatch(setCredentials({ token: data.token, user: data.user }))
      toast.success('Logged in successfully.')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid OTP.'
      dispatch(setError(msg))
      toast.error(msg)
    }
  }

  const signOut = () => {
    dispatch(logout())
    navigate('/login')
    toast.success('Logged out.')
  }

  return { user, isAuth, loading, loginWithGoogle, sendOTP, loginWithOTP, signOut }
}
