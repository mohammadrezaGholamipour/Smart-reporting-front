import { marked } from 'marked'
import DOMPurify from 'dompurify'

marked.setOptions({ gfm: true, breaks: true })

/** تبدیل مارک‌داون به HTML امن (پاسخ مدل زبانی هرگز بدون پاک‌سازی نمایش داده نمی‌شود). */
export function renderMarkdown(text = '') {
  return DOMPurify.sanitize(marked.parse(String(text)))
}
