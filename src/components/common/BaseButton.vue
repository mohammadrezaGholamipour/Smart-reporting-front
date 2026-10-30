<template>
  <button
    :class="[
      'relative inline-flex items-center justify-center font-medium transition-all duration-300 rounded-xl active:scale-95 disabled:opacity-50 disabled:pointer-events-none overflow-hidden group',
      variantClasses,
      sizeClasses
    ]"
    v-bind="$attrs"
  >
    <!-- Shimmer Effect Layer -->
    <span class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></span>
    
    <span class="relative flex items-center gap-2">
      <slot name="icon-lead" />
      <slot />
      <slot name="icon-trail" />
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary, secondary, outline, danger
  size: { type: String, default: 'md' } // sm, md, lg
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:brightness-110'
    case 'secondary':
      return 'bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 border border-amber-500/20 hover:border-amber-500/40'
    case 'outline':
      return 'border border-amber-500/40 hover:border-amber-400 text-amber-300 hover:bg-amber-500/10'
    case 'danger':
      return 'bg-gradient-to-r from-red-600 to-rose-700 text-white hover:shadow-lg hover:shadow-red-500/30'
    default:
      return 'bg-amber-500 text-slate-950'
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'px-3 py-1.5 text-xs'
    case 'lg': return 'px-6 py-3.5 text-base'
    default: return 'px-4 py-2.5 text-sm'
  }
})
</script>
