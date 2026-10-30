const nf = new Intl.NumberFormat('fa-IR')
const nf2 = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 2 })
const dtf = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' })

export const faNumber = (v) => (v == null || Number.isNaN(Number(v)) ? '—' : nf.format(Number(v)))
export const faDecimal = (v) => (v == null || Number.isNaN(Number(v)) ? '—' : nf2.format(Number(v)))
export const faPercent = (v) => (v == null ? '—' : `${nf2.format(Number(v))}٪`)

export function faDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : dtf.format(d)
}

const PERSIAN_TO_EN = { '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9', '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9' }

/** تبدیل مقدار (عدد، «۱۲٬۳۴۵»، «80%»، «(1,200)») به عدد؛ در غیر این صورت null. */
export function parseNumeric(value) {
  if (value == null || typeof value === 'boolean') return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null

  let text = String(value)
    .replace(/[۰-۹٠-٩]/g, (d) => PERSIAN_TO_EN[d])
    .replace(/[٬،]/g, ',')
    .replace(/٫/g, '.')
    .replace(/\u2212/g, '-')
    .trim()
  if (!text) return null

  let negative = false
  if (text.startsWith('(') && text.endsWith(')')) {
    negative = true
    text = text.slice(1, -1).trim()
  }
  text = text.replace(/[%٪]$/, '').replace(/[,\s]/g, '')
  if (!/^[+-]?\d+(\.\d+)?$/.test(text)) return null

  const n = Number(text)
  return negative ? -n : n
}

export const isPercentText = (value) => typeof value === 'string' && /[%٪]\s*$/.test(value.trim()) && parseNumeric(value) !== null

const UNIT_LABELS = {
  irr: 'ریال',
  rial: 'ریال',
  rials: 'ریال',
  ریال: 'ریال',
  irt: 'تومان',
  toman: 'تومان',
  تومان: 'تومان',
  usd: 'دلار',
  dollar: 'دلار',
  eur: 'یورو',
  unit: 'واحد',
  units: 'واحد',
  pcs: 'عدد',
  '%': '٪',
  percent: '٪',
  pct: '٪',
}

/** نام واحد را فارسی می‌کند؛ واحدهای ناشناخته همان‌طور که هستند برمی‌گردند. */
export function unitLabel(unit) {
  if (!unit) return ''
  const key = String(unit).trim().toLowerCase()
  return UNIT_LABELS[key] ?? String(unit).trim()
}

export const isPercentUnit = (unit) => ['%', '٪', 'percent', 'pct', 'درصد'].includes(String(unit ?? '').trim().toLowerCase())
export const isCurrencyUnit = (unit) => ['ریال', 'تومان', 'دلار', 'یورو'].includes(unitLabel(unit))

const SCALES = [
  [1e12, 'هزار میلیارد'],
  [1e9, 'میلیارد'],
  [1e6, 'میلیون'],
  [1e3, 'هزار'],
]

/**
 * قالب فشردهٔ فارسی: ۱۲٬۴۵۰٬۰۰۰٬۰۰۰ → «۱۲٫۴۵ میلیارد». اعداد کوچک‌تر از `from` کامل نمایش داده می‌شوند.
 */
export function compactNumber(value, { from = 10_000 } = {}) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  const abs = Math.abs(n)
  if (abs < from) return nf2.format(n)
  for (const [size, label] of SCALES) {
    if (abs >= size) return `${nf2.format(n / size)} ${label}`
  }
  return nf2.format(n)
}

/**
 * قالب‌بندی یک مقدار برای نمایش (KPI، برچسب، tooltip).
 * @param {{unit?: string, compact?: boolean, percent?: boolean}} opts
 */
export function formatValue(value, { unit = '', compact = false, percent = false } = {}) {
  if (value == null || value === '') return '—'
  const n = typeof value === 'number' ? value : parseNumeric(value)
  if (n == null) return String(value)

  if (percent || isPercentUnit(unit)) return `${nf2.format(n)}٪`
  const text = compact ? compactNumber(n) : nf2.format(n)
  const label = unitLabel(unit)
  return label ? `${text} ${label}` : text
}

/** «Revenue (IRR)» → { label: 'Revenue', unit: 'IRR' } */
export function splitLabelUnit(raw) {
  const text = String(raw ?? '').trim()
  const match = text.match(/^(.*?)\s*[(（]([^)）]+)[)）]\s*$/)
  return match && match[1] ? { label: match[1].trim(), unit: match[2].trim() } : { label: text, unit: '' }
}

export function timeAgo(value) {
  if (!value) return '—'
  const diff = (new Date(value).getTime() - Date.now()) / 1000
  const rtf = new Intl.RelativeTimeFormat('fa', { numeric: 'auto' })
  const steps = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [unit, secs] of steps) {
    if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit)
  }
  return 'همین حالا'
}
