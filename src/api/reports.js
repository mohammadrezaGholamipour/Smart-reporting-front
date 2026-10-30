import { http } from './http'

// ساخت داشبورد شامل فراخوانی مدل زبانی است و می‌تواند چند دقیقه طول بکشد.
const LONG = { timeout: 5 * 60_000 }

export const dashboardApi = {
  get: (sourceId) => http.get(`/reports/${sourceId}/dashboard`).then((r) => r.data),

  generate: (sourceId, { instruction = null, use_llm = true } = {}) =>
    http
      .post(`/reports/${sourceId}/dashboard`, { instruction: instruction?.trim() || null, use_llm }, LONG)
      .then((r) => r.data),
}
