// api/dashboard.js
import api from './axios'

export const getDashboardStats = () => api.get('/dashboard')
export const getMovements      = (params) => api.get('/movements', { params })
