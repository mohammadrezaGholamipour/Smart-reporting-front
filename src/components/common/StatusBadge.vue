<script setup>
import { computed } from 'vue'
import { SOURCE_STATUS } from '@/utils/constants'

const props = defineProps({ status: { type: String, required: true } })

const meta = computed(() => SOURCE_STATUS[props.status] ?? { label: props.status, tone: 'neutral' })
const tones = {
  neutral: 'bg-card-soft text-ink-soft',
  info: 'bg-lapis-soft text-lapis',
  ok: 'bg-ok-soft text-ok',
  danger: 'bg-danger-soft text-danger',
}
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors duration-300"
    :class="tones[meta.tone]"
  >
    <span class="relative flex size-1.5" aria-hidden="true">
      <span v-if="status === 'processing'" class="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60" />
      <span class="relative inline-flex size-1.5 rounded-full bg-current" />
    </span>
    {{ meta.label }}
  </span>
</template>
