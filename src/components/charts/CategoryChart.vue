<script setup>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'
import { useChartTheme } from '@/composables/useChartTheme'
import { faCategory, faDecimal, compactRial } from '@/utils/format'

const props = defineProps({ categories: { type: Array, required: true } })
const t = useChartTheme()

const option = computed(() => {
  const c = t.value
  return {
    textStyle: { fontFamily: c.font },
    color: [c.brand, c.lapis, c.saffron, c.danger],
    tooltip: {
      trigger: 'item',
      backgroundColor: c.card,
      borderColor: c.line,
      textStyle: { color: c.ink, fontFamily: c.font },
      extraCssText: 'direction: rtl; text-align: right;',
      formatter: (p) => `${p.name}<br/>درآمد: ${compactRial(p.value)} ریال<br/>سهم: ${faDecimal(p.percent)}٪`,
    },
    legend: { bottom: 0, textStyle: { color: c.soft, fontFamily: c.font }, itemGap: 16 },
    series: [
      {
        type: 'pie',
        radius: ['52%', '76%'],
        center: ['50%', '44%'],
        padAngle: 3,
        itemStyle: { borderRadius: 8, borderColor: c.card, borderWidth: 2 },
        label: { show: false },
        emphasis: { scale: true, scaleSize: 6 },
        data: props.categories.map((x) => ({ name: faCategory(x.category), value: x.revenue })),
      },
    ],
  }
})
</script>

<template>
  <BaseChart :option="option" height="17rem" label="نمودار سهم درآمد هر دستهٔ محصول" />
</template>
