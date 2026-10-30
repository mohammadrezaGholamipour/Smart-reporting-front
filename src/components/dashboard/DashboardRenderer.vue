<script setup>
import { computed } from 'vue'
import { normalizeChart } from '@/utils/chartModel'
import KpiRenderer from './KpiRenderer.vue'
import ChartRenderer from './ChartRenderer.vue'
import TableRenderer from './TableRenderer.vue'

const props = defineProps({
  dashboard: { type: Object, required: true },
})

const components = computed(() => props.dashboard?.components ?? [])
const kpis = computed(() => components.value.filter((c) => c.type === 'kpi'))
const tables = computed(() => components.value.filter((c) => c.type === 'table'))

// نمودارهای بدون داده‌ی قابل‌نمایش اصلاً در صفحه نمی‌آیند.
const charts = computed(() => components.value.filter((c) => c.type === 'chart' && normalizeChart(c).valid))

/** نمودارهای پهن (روند زمانی، سری‌های زیاد، نقطه‌های زیاد) کل عرض را می‌گیرند. */
function wide(component) {
  const m = normalizeChart(component)
  const type = component.chart_type
  return m.count > 8 || m.series.length > 2 || ((type === 'line' || type === 'area') && m.count > 4)
}

const empty = computed(() => !kpis.value.length && !charts.value.length && !tables.value.length)
</script>

<template>
  <div class="space-y-8">
    <section v-if="kpis.length" aria-label="شاخص‌های کلیدی">
      <h2 class="mb-3 text-sm font-bold text-ink-soft">شاخص‌های کلیدی</h2>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiRenderer v-for="(item, i) in kpis" :key="item.id ?? i" :component="item" :index="i" />
      </div>
    </section>

    <section v-if="charts.length" aria-label="نمودارها">
      <h2 class="mb-3 text-sm font-bold text-ink-soft">نمودارها</h2>
      <div class="grid grid-flow-dense gap-6 lg:grid-cols-2">
        <ChartRenderer
          v-for="(item, i) in charts"
          :key="item.id ?? i"
          :component="item"
          :class="wide(item) && 'lg:col-span-2'"
        />
      </div>
    </section>

    <section v-if="tables.length" aria-label="جدول‌ها">
      <h2 class="mb-3 text-sm font-bold text-ink-soft">جدول‌ها</h2>
      <div class="space-y-6">
        <TableRenderer v-for="(item, i) in tables" :key="item.id ?? i" :component="item" />
      </div>
    </section>

    <div v-if="empty" class="rounded-panel border border-line bg-card p-8 text-center text-sm text-ink-mute">
      این داشبورد شاخص، نمودار یا جدول قابل نمایشی ندارد؛ بخش تحلیل متنی را در ادامه ببینید.
    </div>
  </div>
</template>
