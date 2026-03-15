// api/auth.js
import api from './axios'

export const googleLogin    = (credential) => api.post('/auth/google', { credential })
export const requestOTP     = (email)      => api.post('/auth/otp/request', { email })
export const verifyOTP      = (email, otp) => api.post('/auth/otp/verify', { email, otp })
export const getMe          = ()           => api.get('/auth/me')
