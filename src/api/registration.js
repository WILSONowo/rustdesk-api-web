import request from '@/utils/request'

export const registrationCaptcha = () => request({ url: '/user/registration-captcha', method: 'get' })
export const registrationAvailability = (field, value) => request({ url: '/user/registration-availability', method: 'post', data: { field, value } })
