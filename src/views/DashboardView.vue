<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { BarChart3, Braces, FileText, Printer, RefreshCw, Sparkles } from 'lucide-vue-next'

import DashboardRenderer from '@/components/dashboard/DashboardRenderer.vue'
import NarrativePanel from '@/components/dashboard/NarrativePanel.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import BaseButton from '@/components/common/BaseButton.vue'

import { useDashboardStore } from '@/stores/dashboard'
import { useSourcesStore } from '@/stores/sources'
import { DASHBOARD_HINTS } from '@/utils/constants'
import { faNumber } from '@/utils/format'

const store = useDashboardStore()
const sources = useSourcesStore()

const instruction = ref('')
const useLlm = ref(true)

// فقط اسنادی که استخراج متن‌شان کامل شده است
const eligible = computed(() => sources.items.filter((s) => ['processed', 'embedded'].includes(s.status)))

const selected = computed({
  get: () => store.sourceId,
  set: (id) => (store.sourceId = id),
})

const dashboard = computed(() => store.dashboard)
const busy = computed(() => store.loading || store.generating)
const selectedName = computed(() => {
  const s = sources.items.find((x) => x.id === selected.value)
  return s?.name || s?.original_filename || ''
})

// هر بار سند عوض شد (یا فهرست اسناد رسید)، آخرین گزارش همان سند خودکار بارگیری می‌شود.
watch(
  [() => selected.value, () => sources.loaded],
  ([id, loaded]) => {
    if (!loaded) return
    if (id == null) return store.clear()
    if (!eligible.value.some((s) => s.id === id)) {
      store.sourceId = null // سند حذف شده یا هنوز پردازش نشده
      return store.clear()
    }
    store.fetchDashboard(id)
  },
  { immediate: true },
)

function generate() {
  if (!selected.value) return
  store.generate(selected.value, { instruction: instruction.value, use_llm: useLlm.value })
}

// پیام‌های پیشرفت هنگام ساخت (فقط برای اینکه کاربر بداند سیستم کار می‌کند)
const STAGES = ['در حال خواندن جدول‌ها و ساخت نمودارها…', 'تحلیل متن سند با مدل زبانی…', 'اعتبارسنجی اعداد با متن سند…', 'در حال نهایی‌کردن گزارش…']
const stage = ref(0)
let timer = null
watch(
  () => store.generating,
  (on) => {
    clearInterval(timer)
    stage.value = 0
    if (on) timer = setInterval(() => (stage.value = Math.min(stage.value + 1, STAGES.length - 1)), 9000)
  },
)
onBeforeUnmount(() => clearInterval(timer))

const printPage = () => window.print()

function downloadJson() {
  const blob = new Blob([JSON.stringify(dashboard.value, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `dashboard-${selected.value}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}
</script>

<template>
  <div class="space-y-6">
    <!-- انتخاب سند و تنظیمات -->
    <section class="no-print rounded-panel border border-line bg-card p-5">
      <div class="flex flex-wrap items-end gap-4">
        <div class="min-w-56 flex-1">
          <label for="dashboard-source" class="mb-2 block text-sm font-medium text-ink">سند</label>
          <select
            id="dashboard-source"
            v-model="selected"
            class="h-11 w-full rounded-control border border-line bg-card px-3 text-sm text-ink"
            :disabled="busy"
          >
            <option :value="null" disabled>انتخاب سند…</option>
            <option v-for="s in eligible" :key="s.id" :value="s.id">{{ s.name || s.original_filename }}</option>
          </select>
        </div>

        <BaseButton :disabled="!selected || busy" :loading="store.generating" @click="generate">
          <component :is="dashboard ? RefreshCw : BarChart3" class="size-4" aria-hidden="true" />
          {{ dashboard ? 'بازسازی گزارش' : 'ساخت گزارش' }}
        </BaseButton>
      </div>

      <div v-if="selected" class="mt-5 space-y-3">
        <div>
          <label for="dashboard-instruction" class="mb-2 block text-sm font-medium text-ink">
            تمرکز گزارش <span class="font-normal text-ink-mute">(اختیاری)</span>
          </label>
          <textarea
            id="dashboard-instruction"
            v-model="instruction"
            rows="2"
            maxlength="1000"
            dir="auto"
            placeholder="مثلاً: روی روند و مقایسه‌ها تمرکز کن؛ یا فقط مهارت‌ها را نمودار کن…"
            class="w-full rounded-control border border-line bg-card px-3 py-3 text-sm text-ink outline-none focus:border-turquoise"
          />
          <div class="mt-2 flex flex-wrap gap-2">
            <button
              v-for="hint in DASHBOARD_HINTS"
              :key="hint"
              type="button"
              class="rounded-full border border-line px-3 py-1 text-xs text-ink-soft transition-colors hover:border-turquoise hover:text-turquoise"
              @click="instruction = hint"
            >
              {{ hint }}
            </button>
          </div>
        </div>

        <label class="flex cursor-pointer items-start gap-3 text-sm text-ink-soft">
          <input v-model="useLlm" type="checkbox" class="mt-1 size-4 accent-[var(--turquoise)]" />
          <span>
            <span class="font-medium text-ink">تحلیل هوشمند با مدل زبانی</span>
            <span class="block text-xs leading-6 text-ink-mute">
              اگر خاموش باشد، فقط نمودارها و جدول‌های قطعیِ استخراج‌شده از خود جدول‌ها ساخته می‌شود (سریع‌تر و بدون مدل).
            </span>
          </span>
        </label>
      </div>
    </section>

    <!-- در حال بارگیری / ساخت -->
    <div v-if="busy" class="space-y-6" role="status" aria-live="polite">
      <SkeletonBlock class="h-28" />
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SkeletonBlock v-for="n in 4" :key="n" class="h-32" />
      </div>
      <div class="grid gap-6 lg:grid-cols-2">
        <SkeletonBlock class="h-80" />
        <SkeletonBlock class="h-80" />
      </div>
      <p class="flex items-center justify-center gap-2 text-center text-sm text-ink-mute">
        <Sparkles class="size-4 text-turquoise" aria-hidden="true" />
        {{ store.generating ? STAGES[stage] : 'در حال دریافت گزارش…' }}
      </p>
    </div>

    <!-- خطا -->
    <div v-else-if="store.error" class="rounded-panel bg-danger-soft px-5 py-4 text-sm leading-7 text-danger" role="alert" dir="auto">
      {{ store.error }}
    </div>

    <!-- سندی انتخاب نشده -->
    <EmptyState
      v-else-if="!selected"
      :icon="FileText"
      :title="eligible.length ? 'یک سند انتخاب کنید' : 'هنوز سندی آماده نیست'"
      :description="
        eligible.length
          ? 'برای هر PDF با هر موضوعی می‌توانید داشبوردی از شاخص‌ها، نمودارها و تحلیل بسازید.'
          : 'ابتدا یک PDF بارگذاری کنید و مرحلهٔ «استخراج متن» را اجرا کنید.'
      "
    >
      <RouterLink v-if="!eligible.length" to="/sources"><BaseButton>بارگذاری سند</BaseButton></RouterLink>
    </EmptyState>

    <!-- برای این سند هنوز گزارشی نیست -->
    <EmptyState
      v-else-if="!dashboard"
      :icon="BarChart3"
      title="هنوز گزارشی ساخته نشده است"
      :description="`برای «${selectedName}» می‌توانید اولین داشبورد را بسازید.`"
    >
      <BaseButton @click="generate">ساخت داشبورد</BaseButton>
    </EmptyState>

    <!-- داشبورد -->
    <template v-else>
      <section class="rounded-panel border border-line bg-card p-6">
        <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-mute">
          <span class="inline-flex items-center gap-1.5" dir="auto">
            <FileText class="size-4" aria-hidden="true" />
            {{ dashboard.meta?.source_file || selectedName || 'سند انتخاب‌شده' }}
          </span>
          <span v-if="dashboard.meta?.page_count">{{ faNumber(dashboard.meta.page_count) }} صفحه</span>
          <span v-if="dashboard.meta?.table_count != null">{{ faNumber(dashboard.meta.table_count) }} جدول</span>
          <span
            class="rounded-full px-2 py-0.5"
            :class="dashboard.meta?.llm_used ? 'bg-turquoise-soft text-turquoise' : 'bg-card-soft text-ink-mute'"
          >
            {{ dashboard.meta?.llm_used ? 'با تحلیل هوشمند' : 'بدون مدل زبانی' }}
          </span>

          <div class="no-print ms-auto flex items-center gap-1">
            <button type="button" class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-card-soft hover:text-ink" @click="downloadJson">
              <Braces class="size-4" aria-hidden="true" /> JSON
            </button>
            <button type="button" class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-card-soft hover:text-ink" @click="printPage">
              <Printer class="size-4" aria-hidden="true" /> چاپ / PDF
            </button>
          </div>
        </div>

        <h2 class="mt-4 text-xl font-extrabold leading-9 text-ink" dir="auto">{{ dashboard.title || 'داشبورد' }}</h2>
        <p v-if="dashboard.summary" class="mt-3 max-w-4xl text-sm leading-8 text-ink-soft" dir="auto">{{ dashboard.summary }}</p>
      </section>

      <DashboardRenderer :dashboard="dashboard" />
      <NarrativePanel :dashboard="dashboard" />
    </template>
  </div>
</template>
