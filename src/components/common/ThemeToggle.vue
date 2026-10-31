<script setup>
import { Moon, Sun } from 'lucide-vue-next'
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <button
    type="button"
    class="group relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-card text-ink-soft transition-[transform,border-color,color,box-shadow] duration-300 hover:border-brand/60 hover:text-brand-ink hover:shadow-glow active:scale-90"
    :aria-label="isDark ? 'تغییر به تم روشن' : 'تغییر به تم تیره'"
    :title="isDark ? 'تم روشن' : 'تم تیره'"
    @click="toggleTheme"
  >
    <Sun
      class="absolute size-5 transition-all duration-700 ease-[var(--e-spring)]"
      :class="isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-180 scale-0 opacity-0'"
      aria-hidden="true"
    />
    <Moon
      class="absolute size-5 transition-all duration-700 ease-[var(--e-spring)]"
      :class="isDark ? '-rotate-180 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'"
      aria-hidden="true"
    />
  </button>
</template>
