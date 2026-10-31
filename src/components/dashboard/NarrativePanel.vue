<script setup>
import { computed, ref, watch } from 'vue'
import { AlertTriangle, Info, Lightbulb, OctagonAlert } from 'lucide-vue-next'

const props = defineProps({
  dashboard: { type: Object, required: true },
})

const components = computed(() => props.dashboard?.components ?? [])

const text = (value) =>
  typeof value === 'string' ? value : value && typeof value === 'object' ? (value.text ?? value.content ?? JSON.stringify(value)) : ''

// --- تحلیل متنی (هر component از نوع text یک تب) ---
const tabs = computed(() =>
  components.value
    .filter((c) => c.type === 'text')
    .map((c, i) => ({ key: c.id ?? `text-${i}`, label: c.title || `تحلیل ${i + 1}`, content: text(c.content) })),
)
const active = ref(null)
watch(
  tabs,
  (list) => {
    if (!list.some((t) => t.key === active.value)) active.value = list[0]?.key ?? null
  },
  { immediate: true },
)
const activeContent = computed(() => tabs.value.find((t) => t.key === active.value)?.content ?? '')

// --- یافته‌ها بر اساس شدت ---
const SEVERITY = {
  critical: { label: 'بحرانی', icon: OctagonAlert, box: 'border-danger/30 bg-danger-soft/60', chip: 'bg-danger/15 text-danger' },
  warning: { label: 'هشدار', icon: AlertTriangle, box: 'border-saffron/30 bg-saffron-soft/60', chip: 'bg-saffron/20 text-saffron' },
  info: { label: 'یافته', icon: Lightbulb, box: 'border-line bg-card', chip: 'bg-brand-soft text-brand-ink' },
}
const ORDER = { critical: 0, warning: 1, info: 2 }

const insights = computed(() =>
  components.value
    .filter((c) => c.type === 'insight')
    .map((c) => ({ ...c, tone: SEVERITY[c.severity] ? c.severity : 'info' }))
    .sort((a, b) => ORDER[a.tone] - ORDER[b.tone]),
)

const warnings = computed(() => (props.dashboard?.warnings ?? []).map(text).filter(Boolean))
</script>

<template>
  <div class="space-y-8">
    <section v-if="tabs.length" aria-label="تحلیل متنی" class="reveal rounded-panel border border-line bg-card p-4 shadow-soft sm:p-6">
      <div
        v-if="tabs.length > 1"
        role="tablist"
        aria-label="بخش‌های تحلیل"
        class="no-print mb-5 inline-flex max-w-full flex-wrap rounded-control bg-card-soft p-1"
      >
        <button
          v-for="tab in tabs"
          :key="tab.key"
          role="tab"
          :aria-selected="active === tab.key"
          class="rounded-lg px-4 py-2 text-sm font-medium transition-[background-color,color,box-shadow] duration-300"
          :class="active === tab.key ? 'bg-card text-ink shadow-sm' : 'text-ink-soft hover:text-ink'"
          @click="active = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
      <h3 v-else class="mb-3 font-bold text-ink">{{ tabs[0].label }}</h3>

      <Transition name="swap" mode="out-in">
        <div :key="active" role="tabpanel" class="max-w-4xl whitespace-pre-line text-sm leading-9 text-ink-soft" dir="auto">
          {{ activeContent }}
        </div>
      </Transition>
    </section>

    <section v-if="insights.length" aria-label="یافته‌ها و نکات">
      <h2 class="mb-3 text-sm font-bold text-ink-soft">یافته‌ها و نکات</h2>
      <ul class="grid gap-4 md:grid-cols-2">
        <li v-for="(item, i) in insights" :key="item.id ?? i" class="reveal lift rounded-panel border p-4 sm:p-5" :style="{ '--i': i }" :class="SEVERITY[item.tone].box">
          <div class="mb-2 flex items-center gap-2">
            <component :is="SEVERITY[item.tone].icon" class="size-4.5 shrink-0" :class="item.tone === 'info' ? 'text-brand-ink' : item.tone === 'warning' ? 'text-saffron' : 'text-danger'" aria-hidden="true" />
            <h3 class="flex-1 text-sm font-bold text-ink" dir="auto">{{ item.title }}</h3>
            <span class="rounded-full px-2 py-0.5 text-[0.7rem] font-medium" :class="SEVERITY[item.tone].chip">
              {{ SEVERITY[item.tone].label }}
            </span>
          </div>
          <p class="text-sm leading-8 text-ink-soft" dir="auto">{{ text(item.content) }}</p>
        </li>
      </ul>
    </section>

    <section v-if="warnings.length" class="rounded-panel border border-line bg-card-soft p-5">
      <h3 class="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
        <Info class="size-4 text-ink-mute" aria-hidden="true" /> توضیحات و محدودیت‌های گزارش
      </h3>
      <ul class="space-y-2 text-xs leading-7 text-ink-mute">
        <li v-for="(w, i) in warnings" :key="i" dir="auto">{{ w }}</li>
      </ul>
    </section>
  </div>
</template>
