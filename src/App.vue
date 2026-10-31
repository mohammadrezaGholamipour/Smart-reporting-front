<script setup>
import { Toaster } from 'vue-sonner'
import { useMediaQuery } from '@vueuse/core'
import { useTheme } from '@/composables/useTheme'

const { isDark } = useTheme()
// روی موبایل پایین صفحه منوی ناوبری است؛ پس پیام‌ها بالا نمایش داده می‌شوند.
const isDesktop = useMediaQuery('(min-width: 768px)')
</script>

<template>
  <RouterView />
  <Toaster
    :position="isDesktop ? 'bottom-left' : 'top-center'"
    rtl
    close-button
    :theme="isDark ? 'dark' : 'light'"
    :toast-options="{ style: { fontFamily: 'var(--font-sans)', direction: 'rtl' } }"
  />
</template>
