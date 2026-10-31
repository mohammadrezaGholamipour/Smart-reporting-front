<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Loader2 } from 'lucide-vue-next'

const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | outline | ghost | danger
  size: { type: String, default: 'md' }, // sm | md | lg
  loading: Boolean,
  disabled: Boolean,
  block: Boolean,
  to: { type: [String, Object], default: null },
  type: { type: String, default: 'button' },
})

const tag = computed(() => (props.to ? RouterLink : 'button'))

const variants = {
  primary: 'bg-brand text-on-brand font-bold shadow-soft hover:shadow-glow hover:brightness-105',
  secondary: 'bg-card-soft text-ink border border-line hover:border-brand/60 hover:text-brand-ink',
  outline: 'border border-brand/50 text-brand-ink hover:bg-brand-soft',
  ghost: 'text-ink-soft hover:bg-card-soft hover:text-ink',
  danger: 'bg-danger text-white font-bold hover:brightness-110 hover:shadow-lg',
}
const sizes = {
  sm: 'h-9 gap-1.5 px-3 text-xs',
  md: 'h-11 gap-2 px-4 text-sm',
  lg: 'h-12 gap-2.5 px-6 text-base',
}
</script>

<template>
  <component
    :is="tag"
    :to="to || undefined"
    :type="to ? undefined : type"
    :disabled="to ? undefined : disabled || loading"
    :aria-busy="loading || undefined"
    class="group relative inline-flex select-none items-center justify-center overflow-hidden whitespace-nowrap rounded-control font-medium transition-[transform,box-shadow,background-color,border-color,color,filter] duration-300 ease-out active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50"
    :class="[variants[variant] ?? variants.primary, sizes[size] ?? sizes.md, block && 'w-full']"
  >
    <!-- درخشش عبوری روی دکمهٔ اصلی -->
    <span
      v-if="variant === 'primary'"
      class="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
      aria-hidden="true"
    />
    <Loader2 v-if="loading" class="relative size-4 animate-spin" aria-hidden="true" />
    <span class="relative inline-flex items-center gap-[inherit]"><slot /></span>
  </component>
</template>
