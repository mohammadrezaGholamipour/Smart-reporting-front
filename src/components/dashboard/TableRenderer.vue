<script setup>
import { computed, ref } from 'vue'
import { ArrowDownUp, ArrowDown, ArrowUp, Download } from 'lucide-vue-next'
import { formatValue, parseNumeric, isPercentText, splitLabelUnit } from '@/utils/format'

const props = defineProps({
  component: { type: Object, required: true },
  previewRows: { type: Number, default: 10 },
})

const TOTAL_RE = /^(total|grand\s*total|sum|جمع(\s*کل)?|مجموع|کل)$/i

const rows = computed(() => (Array.isArray(props.component.rows) ? props.component.rows : []))

const columns = computed(() => {
  const declared = Array.isArray(props.component.columns) ? props.component.columns : []
  const keys = declared.length ? declared : rows.value[0] ? Object.keys(rows.value[0]) : []
  return keys.map((c) => {
    const key = typeof c === 'string' ? c : (c.key ?? c.name ?? c.field)
    const label = typeof c === 'string' ? c : (c.label ?? c.title ?? key)
    const values = rows.value.map((r) => r?.[key]).filter((v) => v != null && v !== '')
    const numeric = values.length > 0 && values.filter((v) => parseNumeric(v) !== null).length / values.length >= 0.7
    return { key, label, unit: splitLabelUnit(label).unit, numeric }
  })
})

const labelKey = computed(() => columns.value.find((c) => !c.numeric)?.key ?? columns.value[0]?.key)
const isTotal = (row) => TOTAL_RE.test(String(row?.[labelKey.value] ?? '').trim())

const sort = ref({ key: null, dir: 1 })
function toggleSort(col) {
  sort.value = sort.value.key === col.key ? (sort.value.dir === 1 ? { key: col.key, dir: -1 } : { key: null, dir: 1 }) : { key: col.key, dir: 1 }
}

// ردیف «جمع کل» همیشه آخر می‌ماند و در مرتب‌سازی شرکت نمی‌کند.
const body = computed(() => rows.value.filter((r) => !isTotal(r)))
const totals = computed(() => rows.value.filter(isTotal))

const sorted = computed(() => {
  const { key, dir } = sort.value
  if (!key) return body.value
  const col = columns.value.find((c) => c.key === key)
  return [...body.value].sort((a, b) => {
    const x = col.numeric ? parseNumeric(a[key]) : String(a[key] ?? '')
    const y = col.numeric ? parseNumeric(b[key]) : String(b[key] ?? '')
    if (x == null) return 1
    if (y == null) return -1
    return (col.numeric ? x - y : String(x).localeCompare(String(y), 'fa')) * dir
  })
})

const expanded = ref(false)
const visible = computed(() => (expanded.value ? sorted.value : sorted.value.slice(0, props.previewRows)))
const hidden = computed(() => sorted.value.length - visible.value.length)

function cell(row, col) {
  const value = row?.[col.key]
  if (value == null || value === '') return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  if (col.numeric) {
    const n = parseNumeric(value)
    if (n === null) return String(value)
    return isPercentText(value) ? formatValue(n, { percent: true }) : formatValue(n)
  }
  return String(value)
}

function exportCsv() {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = [columns.value.map((c) => esc(c.label)).join(',')]
  for (const r of [...body.value, ...totals.value]) lines.push(columns.value.map((c) => esc(r[c.key])).join(','))
  // BOM تا Excel متن فارسی را درست بخواند
  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${props.component.id || 'table'}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}
</script>

<template>
  <section class="min-w-0 rounded-panel border border-line bg-card p-4 shadow-soft sm:p-6">
    <header class="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <h3 class="font-bold leading-7 text-ink" dir="auto">{{ component.title || 'جدول اطلاعات' }}</h3>
        <p v-if="component.description" class="mt-1 text-xs text-ink-mute" dir="auto">{{ component.description }}</p>
      </div>
      <button
        v-if="rows.length"
        type="button"
        class="no-print inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-ink-mute transition-colors hover:bg-card-soft hover:text-ink"
        @click="exportCsv"
      >
        <Download class="size-3.5" aria-hidden="true" /> دانلود CSV
      </button>
    </header>

    <div v-if="rows.length && columns.length" class="max-h-[32rem] overflow-auto rounded-control border border-line">
      <table class="w-full min-w-max text-sm">
        <thead class="sticky top-0 z-10 bg-card-soft">
          <tr>
            <th v-for="col in columns" :key="col.key" class="px-4 py-3 text-start font-semibold text-ink" scope="col">
              <button type="button" class="inline-flex items-center gap-1.5" dir="auto" @click="toggleSort(col)">
                {{ col.label }}
                <ArrowUp v-if="sort.key === col.key && sort.dir === 1" class="size-3.5 text-brand-ink" aria-hidden="true" />
                <ArrowDown v-else-if="sort.key === col.key" class="size-3.5 text-brand-ink" aria-hidden="true" />
                <ArrowDownUp v-else class="no-print size-3.5 text-ink-mute/60" aria-hidden="true" />
              </button>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(row, i) in visible" :key="i" class="border-t border-line transition-colors odd:bg-transparent even:bg-card-soft/50 hover:bg-brand-soft/40">
            <td
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-2.5 text-ink-soft"
              :class="col.numeric && 'tabular-nums'"
              :dir="col.numeric ? 'rtl' : 'auto'"
            >
              {{ cell(row, col) }}
            </td>
          </tr>
        </tbody>

        <tfoot v-if="totals.length">
          <tr v-for="(row, i) in totals" :key="`t${i}`" class="border-t-2 border-line bg-brand-soft/50 font-bold text-ink">
            <td v-for="col in columns" :key="col.key" class="px-4 py-3" :class="col.numeric && 'tabular-nums'" :dir="col.numeric ? 'rtl' : 'auto'">
              {{ cell(row, col) }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <p v-else class="py-8 text-center text-sm text-ink-mute">اطلاعاتی برای نمایش وجود ندارد.</p>

    <button
      v-if="hidden > 0 || expanded"
      type="button"
      class="no-print mt-3 w-full rounded-control border border-line py-2 text-xs font-medium text-ink-soft transition-colors hover:bg-card-soft"
      @click="expanded = !expanded"
    >
      {{ expanded ? 'نمایش کمتر' : `نمایش همهٔ ردیف‌ها (${hidden.toLocaleString('fa-IR')} ردیف دیگر)` }}
    </button>
  </section>
</template>
