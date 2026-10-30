<script setup>
import { ref } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DataZoomComponent,
  MarkLineComponent,
  MarkPointComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'

// فقط بخش‌های لازم ECharts بارگذاری می‌شود تا حجم بسته کم بماند.
use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DataZoomComponent,
  MarkLineComponent,
  MarkPointComponent,
])

defineProps({
  option: { type: Object, required: true },
  height: { type: String, default: '20rem' },
  label: { type: String, required: true }, // توضیح برای صفحه‌خوان‌ها
})

const chart = ref(null)

/** تصویر PNG نمودار (برای دانلود) */
function getImage(background) {
  return chart.value?.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: background })
}

defineExpose({ getImage })
</script>

<template>
  <VChart
    ref="chart"
    :option="option"
    autoresize
    role="img"
    :aria-label="label"
    :update-options="{ notMerge: true }"
    :style="{ height, width: '100%' }"
  />
</template>
