import api from './axios'
export const getDeliveries     = (params) => api.get('/deliveries', { params })
export const getDeliveryById   = (id)     => api.get(`/deliveries/${id}`)
export const createDelivery    = (data)   => api.post('/deliveries', data)
export const validateDelivery  = (id)     => api.post(`/deliveries/${id}/validate`)
export const cancelDelivery    = (id)     => api.patch(`/deliveries/${id}/cancel`)
