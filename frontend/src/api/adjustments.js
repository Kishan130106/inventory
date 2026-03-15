import api from './axios'
export const getAdjustments   = ()     => api.get('/adjustments')
export const createAdjustment = (data) => api.post('/adjustments', data)
