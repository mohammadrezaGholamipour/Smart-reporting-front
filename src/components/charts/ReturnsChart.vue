<script setup>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'
import { useChartTheme } from '@/composables/useChartTheme'
import { faMonth, faDecimal } from '@/utils/format'

const props = defineProps({ rows: { type: Array, required: true } })
const t = useChartTheme()

const option = computed(() => {
  const c = t.value
  return {
    textStyle: { fontFamily: c.font },
    grid: { top: 24, right: 40, left: 40, bottom: 24 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: c.card,
      borderColor: c.line,
      textStyle: { color: c.ink, fontFamily: c.font },
      extraCssText: 'direction: rtl; text-align: right;',
      valueFormatter: (v) => `${faDecimal(v)}٪`,
    },
    xAxis: {
      type: 'category',
      inverse: true,
      boundaryGap: false,
      data: props.rows.map((r) => faMonth(r.month)),
      axisLine: { lineStyle: { color: c.line } },
      axisTick: { show: false },
      axisLabel: { color: c.soft, fontFamily: c.font },
    },
    yAxis: {
      type: 'value',
      position: 'right',
      min: 0,
      axisLabel: { color: c.mute, formatter: (v) => `${faDecimal(v)}٪` },
      splitLine: { lineStyle: { color: c.line, type: 'dashed' } },
    },
    series: [
      {
        name: 'نسبت مرجوعی به سفارش',
        type: 'line',
        smooth: true,
        symbolSize: 9,
        data: props.rows.map((r) => r.returns_to_orders_ratio_percentage),
        lineStyle: { color: c.danger, width: 3 },
        itemStyle: { color: c.danger, borderColor: c.card, borderWidth: 2 },
        areaStyle: { color: c.danger, opacity: 0.1 },
      },
    ],
  }
})
</script>

<template>
  <BaseChart :option="option" height="13rem" label="نمودار نسبت مرجوعی به سفارش در هر ماه" />
</template>
