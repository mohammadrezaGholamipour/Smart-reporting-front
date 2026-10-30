<script setup>
import { Toaster } from 'vue-sonner'
import { useTheme } from '@/composables/useTheme'

const { isDark } = useTheme()
</script>

<template>
  <RouterView />
  <Toaster
    position="bottom-left"
    rtl
    :theme="isDark ? 'dark' : 'light'"
    :toast-options="{ style: { fontFamily: 'var(--font-sans)', direction: 'rtl' } }"
  />
</template>
