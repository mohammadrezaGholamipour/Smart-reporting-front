
import { http } from './http'

// عملیات سنگین ممکن است چند دقیقه طول بکشند.
const LONG = { timeout: 15 * 60_000 }

export const sourcesApi = {
  list: () => http.get('/sources').then((response) => response.data),

  get: (id) =>
    http.get(`/sources/${id}`).then((response) => response.data),

  async upload(file, onProgress) {
    const form = new FormData()
    form.append('file', file)

    const response = await http.post('/sources', form, {
      timeout: 5 * 60_000,
      onUploadProgress: (event) => {
        if (event.total) {
          onProgress?.(
            Math.round((event.loaded / event.total) * 100)
          )
        }
      },
    })

    return response.data
  },

  remove: (id) => http.delete(`/sources/${id}`),

  process: (id) =>
    http.post(`/sources/${id}/process`, null, LONG)
      .then((response) => response.data),

  chunk: (id) =>
    http.post(`/sources/${id}/chunk`, null, LONG)
      .then((response) => response.data),

  embed: (id) =>
    http.post(`/sources/${id}/embed`, null, LONG)
      .then((response) => response.data),

  ingest: (id) =>
    http.post(`/sources/${id}/ingest`, null, LONG)
      .then((response) => response.data),

  pageindex: (id) =>
    http.post(`/sources/${id}/pageindex`, null, LONG)
      .then((response) => response.data),
}
