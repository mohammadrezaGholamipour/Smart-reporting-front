
import axios from 'axios'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || '/api/v1'
).replace(/\/+$/, '')

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60_000,
})

function extractMessage(error) {
  if (error.code === 'ERR_CANCELED') {
    return 'درخواست لغو شد.'
  }

  if (error.code === 'ECONNABORTED') {
    return 'پاسخ سرور بیش از حد طول کشید. دوباره تلاش کنید.'
  }

  if (!error.response) {
    return 'ارتباط با سرور برقرار نشد. آدرس بک‌اند و اتصال شبکه را بررسی کنید.'
  }

  const { status, data } = error.response
  const detail = data?.detail

  if (typeof detail === 'string') return detail

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).filter(Boolean).join('، ')
  }

  if (status === 404) return 'مسیر درخواست در سرور پیدا نشد.'
  if (status === 405) return 'متد HTTP برای این مسیر مجاز نیست.'
  if (status === 413) return 'حجم فایل بیشتر از حد مجاز است.'
  if (status === 422) return 'اطلاعات ارسالی معتبر نیست.'
  if (status >= 500) return 'خطای داخلی سرور رخ داد.'

  return 'درخواست ناموفق بود.'
}

http.interceptors.response.use(
  (response) => response,
  (error) => {
    error.userMessage = extractMessage(error)
    return Promise.reject(error)
  },
)

export const errorMessage = (error) =>
  error?.userMessage || error?.message || 'خطای ناشناخته'

export const getApiBaseUrl = () => API_BASE_URL
