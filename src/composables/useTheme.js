import { nextTick } from 'vue'
import { useDark, useToggle } from '@vueuse/core'

// کلاس dark روی <html> قرار می‌گیرد و در localStorage ذخیره می‌شود.
const isDark = useDark({ storageKey: 'sr-theme', selector: 'html', valueDark: 'dark', valueLight: '' })
const toggleDark = useToggle(isDark)

/**
 * تعویض تم با انتقال دایره‌ای که از نقطهٔ کلیک پخش می‌شود.
 * در مرورگرهای بدون View Transitions یا با «کاهش حرکت»، تعویض بدون انیمیشن انجام می‌شود.
 */
async function toggleTheme(event) {
  const next = !isDark.value
  const canAnimate =
    typeof document.startViewTransition === 'function' && !matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!canAnimate) {
    isDark.value = next
    return
  }

  const x = event?.clientX ?? window.innerWidth / 2
  const y = event?.clientY ?? 0
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

  const transition = document.startViewTransition(async () => {
    isDark.value = next
    await nextTick()
  })

  try {
    await transition.ready
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 700, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' },
    )
  } catch {
    /* انتقال لغو شد؛ تم همچنان عوض شده است */
  }
}

export function useTheme() {
  return { isDark, toggleDark, toggleTheme }
}
