import { onBeforeUnmount, ref, watch } from 'vue'

/** شمارندهٔ انیمیشنی: مقدار از صفر تا هدف با easing نرم بالا می‌رود. */
export function useCountUp(target, { duration = 1000 } = {}) {
  const value = ref(0)
  let raf = 0

  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

  function run(to) {
    cancelAnimationFrame(raf)
    if (to == null || reduce) {
      value.value = to ?? 0
      return
    }
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 4)
      value.value = to * eased
      if (t < 1) raf = requestAnimationFrame(tick)
      else value.value = to
    }
    raf = requestAnimationFrame(tick)
  }

  watch(target, run, { immediate: true })
  onBeforeUnmount(() => cancelAnimationFrame(raf))
  return value
}
