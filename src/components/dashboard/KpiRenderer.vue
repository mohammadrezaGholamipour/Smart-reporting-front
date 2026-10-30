<script setup>
import { computed } from 'vue'
import { AlertTriangle, BadgeCheck } from 'lucide-vue-next'
import { formatValue, isCurrencyUnit, isPercentUnit, parseNumeric, unitLabel } from '@/utils/format'

const props = defineProps({
  component: { type: Object, required: true },
  index: { type: Number, default: 0 },
})

const ACCENTS = ['bg-turquoise', 'bg-lapis', 'bg-saffron', 'bg-danger']

const number = computed(() => parseNumeric(props.component.value))
const unit = computed(() => props.component.unit ?? '')

// مبلغ‌های بزرگ فشرده می‌شوند (۱۲٫۴۵ میلیارد ریال) و مقدار کامل در tooltip می‌ماند.
const big = computed(() => number.value !== null && Math.abs(number.value) >= 1e6 && !isPercentUnit(unit.value))

const display = computed(() => {
  if (number.value === null) return String(props.component.value ?? '—')
  if (isPercentUnit(unit.value)) return formatValue(number.value, { percent: true })
  return formatValue(number.value, { compact: big.value })
})

// واحد کنار عدد نمایش داده می‌شود (نه داخل display) تا اندازه‌اش کوچک‌تر باشد.
const unitText = computed(() => (isPercentUnit(unit.value) ? '' : unitLabel(unit.value)))
const fullValue = computed(() =>
  number.value === null ? '' : formatValue(number.value, { unit: unit.value, percent: isPercentUnit(unit.value) }),
)
const currency = computed(() => isCurrencyUnit(unit.value))
</script>

<template>
  <article class="kpi-card relative overflow-hidden rounded-panel border border-line bg-card p-5" :title="fullValue">
    <span class="absolute inset-x-0 top-0 h-1" :class="ACCENTS[index % ACCENTS.length]" aria-hidden="true" />

    <p class="text-sm font-medium leading-6 text-ink-soft" dir="auto">{{ component.title }}</p>

    <p class="mt-3 flex flex-wrap items-baseline gap-x-2 text-3xl font-extrabold leading-tight text-ink" dir="rtl">
      <span class="tabular-nums">{{ display }}</span>
      <span v-if="unitText" class="text-sm font-medium text-ink-mute" :class="{ 'opacity-80': currency }">{{ unitText }}</span>
    </p>

    <p v-if="component.description" class="mt-3 text-xs leading-6 text-ink-mute" dir="auto">
      {{ component.description }}
    </p>

    <p
      v-if="component.verified === false"
      class="mt-3 flex items-center gap-1.5 text-xs text-saffron"
      title="این عدد عیناً در سند پیدا نشد؛ پیش از استفاده بررسی شود."
    >
      <AlertTriangle class="size-3.5" aria-hidden="true" /> تأییدنشده
    </p>
    <p v-else-if="component.verified === true" class="mt-3 flex items-center gap-1.5 text-xs text-ok">
      <BadgeCheck class="size-3.5" aria-hidden="true" /> مطابق سند
    </p>
  </article>
</template>
