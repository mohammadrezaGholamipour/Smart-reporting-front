import { http } from './http'

export const chatApi = {
  ask: ({ query, sourceId = null, sessionId = null, topK = 4, mode = 'embedding' }, signal) =>
    http
      .post(
        '/chat',
        {
          query,
          source_id: sourceId,
          // با فرستادن session_id بک‌اند پیام‌های قبلی را به خاطر می‌آورد («بله» به پیشنهاد قبلی وصل می‌شود)
          session_id: sessionId || null,
          top_k: topK,
          retrieval_mode: mode,
        },
        { timeout: 3 * 60_000, signal },
      )
      .then((r) => r.data),

  remove: (sessionId) => http.delete(`/chat/${sessionId}`).catch(() => null),
}
