import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import { chatApi } from '@/api/chat.api'
import { errorMessage } from '@/api/http'

let seq = Date.now()
const uid = () => `m${seq++}`

export const useChatStore = defineStore('chat', () => {
  // نمایش گفتگو در مرورگر ذخیره می‌شود؛ حافظهٔ واقعی مدل در بک‌اند و با sessionId نگه‌داری می‌شود.
  const messages = useStorage('sr-chat-messages', [])
  const sessionId = useStorage('sr-chat-session', '')
  const settings = useStorage('sr-chat-settings', { sourceId: null, topK: 4, mode: 'embedding' })
  const sending = ref(false)
  let controller = null

  watch(
    messages,
    (list) => {
      if (list.length > 50) messages.value = list.slice(-50)
    },
    { deep: false },
  )

  function ask(query, signal) {
    return chatApi.ask(
      {
        query,
        sourceId: settings.value.sourceId,
        sessionId: sessionId.value,
        topK: settings.value.topK,
        mode: settings.value.mode,
      },
      signal,
    )
  }

  async function send(text) {
    const query = text.trim()
    if (!query || sending.value) return

    messages.value.push({ id: uid(), role: 'user', content: query, at: Date.now() })
    sending.value = true
    controller = new AbortController()

    try {
      let res
      try {
        res = await ask(query, controller.signal)
      } catch (e) {
        // گفتگوی ذخیره‌شده در بک‌اند نیست (مثلاً دیتابیس عوض شده)؛ با گفتگوی تازه یک‌بار دیگر تلاش می‌کنیم.
        if (e.response?.status === 404 && sessionId.value) {
          sessionId.value = ''
          res = await ask(query, controller.signal)
        } else {
          throw e
        }
      }

      if (res.session_id) sessionId.value = res.session_id

      messages.value.push({
        id: uid(),
        role: 'assistant',
        content: res.answer,
        sources: res.sources ?? [],
        mode: res.retrieval_mode,
        // اگر مدل پیام کوتاهی مثل «بله» را بازنویسی کرده باشد، نشان داده می‌شود
        understood: res.standalone_query && res.standalone_query !== query ? res.standalone_query : null,
        at: Date.now(),
      })
    } catch (e) {
      if (e.code === 'ERR_CANCELED') {
        messages.value.push({ id: uid(), role: 'assistant', content: 'پرسش متوقف شد.', error: true, at: Date.now() })
      } else {
        messages.value.push({ id: uid(), role: 'assistant', content: errorMessage(e), error: true, retry: query, at: Date.now() })
      }
    } finally {
      sending.value = false
      controller = null
    }
  }

  const stop = () => controller?.abort()

  function retry(message) {
    const i = messages.value.findIndex((m) => m.id === message.id)
    if (i >= 0) messages.value.splice(i, 1)
    return send(message.retry)
  }

  /** گفتگوی جدید: هم نمایش پاک می‌شود و هم حافظهٔ بک‌اند. */
  function clear() {
    const old = sessionId.value
    messages.value = []
    sessionId.value = ''
    if (old) chatApi.remove(old)
  }

  return { messages, settings, sessionId, sending, send, stop, retry, clear }
})
