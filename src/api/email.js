import request from '@/utils/request'

export const emailOptions = () => request({ url: '/email/options' })
export const requestEmailCode = (purpose, data) => request({ url: `/email/${purpose}-code`, method: 'post', data })
export const bindEmail = (data) => request({ url: '/email/bind', method: 'post', data })
export const resetEmailPassword = (data) => request({ url: '/email/reset-password', method: 'post', data })
