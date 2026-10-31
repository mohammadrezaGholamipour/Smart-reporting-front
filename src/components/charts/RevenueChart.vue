<script setup>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'
import { useChartTheme } from '@/composables/useChartTheme'
import { faMonth, faNumber, compactRial } from '@/utils/format'

const props = defineProps({ months: { type: Array, required: true } })
const t = useChartTheme()

const option = computed(() => {
  const c = t.value
  return {
    textStyle: { fontFamily: c.font },
    grid: { top: 40, right: 56, left: 56, bottom: 28 },
    legend: { top: 0, textStyle: { color: c.soft, fontFamily: c.font }, itemGap: 20 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: c.card,
      borderColor: c.line,
      textStyle: { color: c.ink, fontFamily: c.font },
      extraCssText: 'direction: rtl; text-align: right;',
      valueFormatter: (v) => faNumber(v),
    },
    xAxis: {
      type: 'category',
      inverse: true, // جهت خواندن فارسی: قدیمی‌ترین ماه سمت راست
      data: props.months.map((m) => faMonth(m.month)),
      axisLine: { lineStyle: { color: c.line } },
      axisTick: { show: false },
      axisLabel: { color: c.soft, fontFamily: c.font },
    },
    yAxis: [
      {
        type: 'value',
        position: 'right',
        axisLabel: { color: c.mute, formatter: (v) => compactRial(v) },
        splitLine: { lineStyle: { color: c.line, type: 'dashed' } },
      },
      {
        type: 'value',
        position: 'left',
        axisLabel: { color: c.mute, formatter: (v) => faNumber(v) },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: 'درآمد (ریال)',
        type: 'bar',
        barMaxWidth: 46,
        data: props.months.map((m) => m.revenue),
        itemStyle: { color: c.brand, borderRadius: [8, 8, 0, 0] },
      },
      {
        name: 'تعداد سفارش',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbolSize: 9,
        data: props.months.map((m) => m.orders),
        lineStyle: { color: c.saffron, width: 3 },
        itemStyle: { color: c.saffron, borderColor: c.card, borderWidth: 2 },
      },
    ],
  }
})
</script>

<template>
  <BaseChart :option="option" label="نمودار درآمد و تعداد سفارش به تفکیک ماه" />
</template>
