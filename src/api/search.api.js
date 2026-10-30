import { http } from './http'

export const searchApi = {
  query: ({ query, sourceId = null, topK = 5 }, signal) =>
    http
      .post('/search', { query, source_id: sourceId, top_k: topK }, { signal })
      .then((r) => r.data),
}
