import request from '@/utils/request'

export const getClientResources = () => request({ url: '/client-resources' })
export const saveClientResources = data => request({ url: '/client-resources', method: 'put', data })
