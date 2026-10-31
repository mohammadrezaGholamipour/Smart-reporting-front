import axios from 'axios'

export const http = axios.create({
  baseURL: 'https://smart-reporting.vercel.app/api/v1',
  timeout: 60_000,
})

/** FastAPI خطا را به شکل رشته یا لیست خطاهای اعتبارسنجی برمی‌گرداند؛ هر دو را به یک پیام فارسی تبدیل می‌کنیم. */
function extractMessage(error) {
  if (error.code === 'ERR_CANCELED') return 'درخواست لغو شد.'
  if (error.code === 'ECONNABORTED') return 'پاسخ سرور بیش از حد طول کشید. دوباره تلاش کنید.'
  if (!error.response) return 'ارتباط با سرور برقرار نشد. از روشن بودن بک‌اند مطمئن شوید.'

  const { status, data } = error.response
  const detail = data?.detail

  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((d) => d.msg).filter(Boolean).join('، ')
  if (status === 413) return 'حجم فایل بیشتر از حد مجاز است.'
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

export const errorMessage = (e) => e?.userMessage || e?.message || 'خطای ناشناخته'
