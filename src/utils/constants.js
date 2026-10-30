// مراحل آماده‌سازی یک سند، به همان ترتیبی که بک‌اند انتظار دارد.
export const PIPELINE_STEPS = [
  { key: 'process', label: 'استخراج متن', hint: 'خواندن متن و جدول‌های PDF' },
  { key: 'chunk', label: 'قطعه‌بندی', hint: 'تقسیم متن به بخش‌های کوچک‌تر' },
  { key: 'embed', label: 'بردارسازی', hint: 'ساخت نمایهٔ معنایی برای جست‌وجو' },
  { key: 'pageindex', label: 'ایندکس صفحه‌ای', hint: 'ساخت درخت ساختاری سند (اختیاری)', optional: true },
]

export const SOURCE_STATUS = {
  uploaded: { label: 'بارگذاری‌شده', tone: 'neutral' },
  processing: { label: 'در حال پردازش', tone: 'info' },
  processed: { label: 'متن استخراج شد', tone: 'info' },
  embedded: { label: 'آمادهٔ پرسش', tone: 'ok' },
  failed: { label: 'ناموفق', tone: 'danger' },
}

export const RETRIEVAL_MODES = [
  { value: 'embedding', label: 'جست‌وجوی معنایی', hint: 'بازیابی قطعه‌های نزدیک به پرسش از ChromaDB' },
  { value: 'pageindex', label: 'ایندکس صفحه‌ای', hint: 'استدلال روی ساختار سند؛ نیازمند انتخاب یک سند' },
]

export const MAX_UPLOAD_MB = 25

// پرسش‌های پیشنهادی عمومی؛ به موضوع خاصی وابسته نیستند.
export const SUGGESTED_QUESTIONS = [
  'این سند دربارهٔ چیست؟ خلاصه بده.',
  'مهم‌ترین اعداد و شاخص‌های سند کدام‌اند؟',
  'نکات مهم یا ریسک‌های سند را فهرست کن.',
  'سند شامل چه جدول‌هایی است و هر کدام چه می‌گوید؟',
]

// پیشنهاد دستورالعمل برای ساخت داشبورد
export const DASHBOARD_HINTS = [
  'روی روندها و مقایسه‌ها تمرکز کن',
  'فقط شاخص‌های کلیدی و ریسک‌ها را نشان بده',
  'گزارش را برای مدیران، کوتاه و اجرایی بنویس',
]
