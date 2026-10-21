import request from '@/utils/request'
export const getReadiness = () => request.get('/connection-readiness', { timeout: 5000 })
export const getDeviceOverview = params => request.get('/my/device-overview', { params })
