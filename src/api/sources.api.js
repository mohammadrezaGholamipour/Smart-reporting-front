import { http } from './http'

// مراحل سنگین (امبدینگ و PageIndex) ممکن است چند دقیقه طول بکشند.
const LONG = { timeout: 15 * 60_000 }

export const sourcesApi = {
  list: () => http.get('/sources').then((r) => r.data),

  get: (id) => http.get(`/sources/${id}`).then((r) => r.data),

  upload(file, onProgress) {
    const form = new FormData()
    form.append('file', file)
    return http
      .post('/sources', form, {
        timeout: 5 * 60_000,
        onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded / e.total) * 100)),
      })
      .then((r) => r.data)
  },

  remove: (id) => http.delete(`/sources/${id}`),

  process: (id) => http.post(`/sources/${id}/process`, null, LONG).then((r) => r.data),
  chunk: (id) => http.post(`/sources/${id}/chunk`, null, LONG).then((r) => r.data),
  embed: (id) => http.post(`/sources/${id}/embed`, null, LONG).then((r) => r.data),
  ingest: (id) => http.post(`/sources/${id}/ingest`, null, LONG).then((r) => r.data),
  pageindex: (id) => http.post(`/sources/${id}/pageindex`, null, LONG).then((r) => r.data),
}
