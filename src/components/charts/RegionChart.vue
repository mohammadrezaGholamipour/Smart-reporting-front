<script setup>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'
import { useChartTheme } from '@/composables/useChartTheme'
import { faRegion, faDecimal, compactRial } from '@/utils/format'

const props = defineProps({ regions: { type: Array, required: true } })
const t = useChartTheme()

const option = computed(() => {
  const c = t.value
  const sorted = [...props.regions].sort((a, b) => a.revenue - b.revenue) // بزرگ‌ترین بالا
  return {
    textStyle: { fontFamily: c.font },
    grid: { top: 8, right: 70, left: 24, bottom: 8, containLabel: false },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'none' },
      backgroundColor: c.card,
      borderColor: c.line,
      textStyle: { color: c.ink, fontFamily: c.font },
      extraCssText: 'direction: rtl; text-align: right;',
      formatter: (p) => {
        const r = sorted[p[0].dataIndex]
        return `${faRegion(r.region)}<br/>درآمد: ${compactRial(r.revenue)} ریال<br/>سهم: ${faDecimal(r.share_percentage)}٪`
      },
    },
    xAxis: { type: 'value', inverse: true, show: false, max: (v) => v.max * 1.05 },
    yAxis: {
      type: 'category',
      position: 'right',
      data: sorted.map((r) => faRegion(r.region)),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: c.ink, fontFamily: c.font, fontSize: 13, margin: 12 },
    },
    series: [
      {
        type: 'bar',
        barWidth: 18,
        data: sorted.map((r, i) => ({
          value: r.revenue,
          itemStyle: { color: i === sorted.length - 1 ? c.turquoise : c.lapis, borderRadius: 9, opacity: i === sorted.length - 1 ? 1 : 0.55 },
        })),
        label: {
          show: true,
          position: 'left',
          color: c.soft,
          fontFamily: c.font,
          formatter: (p) => `${faDecimal(sorted[p.dataIndex].share_percentage)}٪`,
        },
        showBackground: true,
        backgroundStyle: { color: c.line, opacity: 0.35, borderRadius: 9 },
      },
    ],
  }
})
</script>

<template>
  <BaseChart :option="option" height="14rem" label="نمودار سهم درآمد هر منطقه" />
</template>
