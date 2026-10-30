import { useDark, useToggle } from '@vueuse/core'

// کلاس dark روی <html> قرار می‌گیرد و در localStorage ذخیره می‌شود.
const isDark = useDark({ storageKey: 'sr-theme', selector: 'html', valueDark: 'dark', valueLight: '' })
const toggleDark = useToggle(isDark)

export function useTheme() {
  return { isDark, toggleDark }
}
