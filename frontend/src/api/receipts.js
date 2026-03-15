import api from './axios'
export const getReceipts     = (params) => api.get('/receipts', { params })
export const getReceiptById  = (id)     => api.get(`/receipts/${id}`)
export const createReceipt   = (data)   => api.post('/receipts', data)
export const validateReceipt = (id)     => api.post(`/receipts/${id}/validate`)
export const cancelReceipt   = (id)     => api.patch(`/receipts/${id}/cancel`)
