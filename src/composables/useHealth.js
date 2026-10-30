import { ref } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import { healthApi } from '@/api/health.api'

const online = ref(null) // null = هنوز بررسی نشده

async function ping() {
  try {
    await healthApi.check()
    online.value = true
  } catch {
    online.value = false
  }
}

let started = false

/** وضعیت اتصال به بک‌اند؛ هر ۳۰ ثانیه یک‌بار بررسی می‌شود. */
export function useHealth() {
  if (!started) {
    started = true
    ping()
    useIntervalFn(ping, 30_000)
  }
  return { online, ping }
}
