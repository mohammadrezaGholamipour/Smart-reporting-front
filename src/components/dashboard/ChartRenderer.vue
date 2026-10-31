<script setup>
import { computed, ref, watch } from 'vue'
import { BarChart3, ChartLine, ChartPie, ChartArea, Download, Table2, AlertTriangle } from 'lucide-vue-next'
import BaseChart from '@/components/charts/BaseChart.vue'
import { useChartTheme } from '@/composables/useChartTheme'
import {
  TYPE_LABELS,
  availableTypes,
  buildChartOption,
  defaultType,
  normalizeChart,
} from '@/utils/chartModel'
import { formatValue } from '@/utils/format'

const props = defineProps({
  component: { type: Object, required: true },
})

const theme = useChartTheme()
const chartRef = ref(null)

const model = computed(() => normalizeChart(props.component))
const types = computed(() => availableTypes(model.value))

// نوع انتخابی کاربر؛ تا وقتی انتخاب نکرده، نوع پیشنهادی (و در صورت نامناسب‌بودن، نوع مناسب) استفاده می‌شود.
const picked = ref(null)
watch(() => props.component, () => (picked.value = null))
const type = computed(() => (picked.value && types.value.includes(picked.value) ? picked.value : defaultType(model.value)))

const view = ref('chart') // chart | data
const built = computed(() => buildChartOption(model.value, type.value, theme.value))

const icons = { bar: BarChart3, line: ChartLine, area: ChartArea, pie: ChartPie }

const tableRows = computed(() =>
  model.value.labels.map((label, i) => ({
    label,
    cells: model.value.series.map((s) => formatValue(s.values[i], { unit: s.unit, percent: s.percent })),
  })),
)

function download() {
  const url = chartRef.value?.getImage(theme.value.card)
  if (!url) return
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.component.id || 'chart'}.png`
  a.click()
}
</script>

<template>
  <section class="chart-card flex min-w-0 flex-col rounded-panel border border-line bg-card p-4 shadow-soft transition-shadow duration-300 hover:shadow-lift sm:p-6">
    <header class="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <h3 class="font-bold leading-7 text-ink" dir="auto">{{ component.title }}</h3>
        <p v-if="component.description" class="mt-1 text-xs leading-6 text-ink-mute" dir="auto">
          {{ component.description }}
        </p>
      </div>

      <div v-if="model.valid" class="no-print flex items-center gap-1">
        <div v-if="types.length > 1" class="flex rounded-control bg-card-soft p-0.5" role="group" aria-label="نوع نمودار">
          <button
            v-for="t in types"
            :key="t"
            type="button"
            class="grid size-8 place-items-center rounded-lg transition-[background-color,color,box-shadow,transform] duration-300 active:scale-90"
            :class="type === t && view === 'chart' ? 'bg-card text-brand-ink shadow-soft' : 'text-ink-mute hover:text-ink'"
            :title="`نمودار ${TYPE_LABELS[t]}`"
            :aria-label="`نمودار ${TYPE_LABELS[t]}`"
            :aria-pressed="type === t"
            @click=";(picked = t), (view = 'chart')"
          >
            <component :is="icons[t]" class="size-4" aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          class="grid size-8 place-items-center rounded-lg transition-[background-color,color,box-shadow,transform] duration-300 active:scale-90"
          :class="view === 'data' ? 'bg-card-soft text-brand-ink' : 'text-ink-mute hover:bg-card-soft hover:text-ink'"
          title="نمایش داده‌ها"
          aria-label="نمایش داده‌ها"
          :aria-pressed="view === 'data'"
          @click="view = view === 'data' ? 'chart' : 'data'"
        >
          <Table2 class="size-4" aria-hidden="true" />
        </button>

        <button
          v-if="view === 'chart'"
          type="button"
          class="grid size-8 place-items-center rounded-lg text-ink-mute transition-colors hover:bg-card-soft hover:text-ink"
          title="دانلود تصویر"
          aria-label="دانلود تصویر نمودار"
          @click="download"
        >
          <Download class="size-4" aria-hidden="true" />
        </button>
      </div>
    </header>

    <p
      v-if="component.verified === false"
      class="mb-3 flex items-start gap-2 rounded-control bg-saffron-soft px-3 py-2 text-xs leading-6 text-saffron"
      role="note"
    >
      <AlertTriangle class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      بعضی از اعداد این نمودار عیناً در سند پیدا نشد؛ پیش از استفاده بررسی شوند.
    </p>

    <template v-if="model.valid">
      <BaseChart
        v-show="view === 'chart'"
        ref="chartRef"
        :option="built.option"
        :height="`${built.height}px`"
        :label="component.title"
      />

      <div v-if="view === 'data'" class="max-h-80 overflow-auto rounded-control border border-line">
        <table class="w-full text-sm">
          <thead class="sticky top-0 bg-card-soft">
            <tr>
              <th class="px-3 py-2 text-start font-semibold text-ink" dir="auto">{{ model.xKey }}</th>
              <th v-for="s in model.series" :key="s.key" class="px-3 py-2 text-start font-semibold text-ink" dir="auto">
                {{ s.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in tableRows" :key="i" class="border-t border-line">
              <td class="px-3 py-2 text-ink" dir="auto">{{ row.label }}</td>
              <td v-for="(cell, j) in row.cells" :key="j" class="px-3 py-2 tabular-nums text-ink-soft" dir="rtl">
                {{ cell }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <div v-else class="grid flex-1 place-items-center py-12 text-center text-sm text-ink-mute">
      داده‌ی عددی قابل‌نمایشی برای این نمودار وجود ندارد.
    </div>
  </section>
</template>
