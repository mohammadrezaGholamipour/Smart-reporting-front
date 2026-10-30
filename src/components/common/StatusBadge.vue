<script setup>
import { computed } from 'vue'
import { SOURCE_STATUS } from '@/utils/constants'

const props = defineProps({ status: { type: String, required: true } })

const meta = computed(() => SOURCE_STATUS[props.status] ?? { label: props.status, tone: 'neutral' })
const tones = {
  neutral: 'bg-card-soft text-ink-soft',
  info: 'bg-saffron-soft text-saffron',
  ok: 'bg-ok-soft text-ok',
  danger: 'bg-danger-soft text-danger',
}
</script>

<template>
  <span :class="['inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', tones[meta.tone]]">
    <span class="size-1.5 rounded-full bg-current" aria-hidden="true" />
    {{ meta.label }}
  </span>
</template>
