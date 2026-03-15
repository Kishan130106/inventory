import api from './axios'
export const getTransfers     = (params) => api.get('/transfers', { params })
export const getTransferById  = (id)     => api.get(`/transfers/${id}`)
export const createTransfer   = (data)   => api.post('/transfers', data)
export const validateTransfer = (id)     => api.post(`/transfers/${id}/validate`)
export const cancelTransfer   = (id)     => api.patch(`/transfers/${id}/cancel`)
