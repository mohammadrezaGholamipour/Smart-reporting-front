import { computed, nextTick, ref, watch } from 'vue'
import { useTheme } from './useTheme'

const read = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

// رنگ‌های تکمیلی برای نمودارهای چندسری؛ برای هر تم جداگانه انتخاب شده‌اند.
const EXTRA = {
  light: ['#7c5cd6', '#e0568a', '#2f8fd1', '#1e8a5a'],
  dark: ['#a78bfa', '#f472b6', '#5ab4f0', '#52d49b'],
}

/** رنگ‌های نمودار از همان توکن‌های CSS خوانده می‌شوند تا با تم روشن/تیره هماهنگ بمانند. */
export function useChartTheme() {
  const { isDark } = useTheme()
  const tick = ref(0)

  watch(isDark, async () => {
    await nextTick()
    tick.value++
  })

  return computed(() => {
    tick.value // وابستگی واکنشی
    const extra = isDark.value ? EXTRA.dark : EXTRA.light
    return {
      ink: read('--ink'),
      soft: read('--ink-soft'),
      mute: read('--ink-mute'),
      line: read('--line'),
      card: read('--card'),
      turquoise: read('--turquoise'),
      lapis: read('--lapis'),
      saffron: read('--saffron'),
      danger: read('--danger'),
      ok: read('--ok'),
      palette: [read('--turquoise'), read('--lapis'), read('--saffron'), read('--danger'), ...extra],
      font: "'Vazirmatn Variable', Vazirmatn, Tahoma, sans-serif",
    }
  })
}
