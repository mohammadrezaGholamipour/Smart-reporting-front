<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { BarChart3, Braces, FileText, Printer, RefreshCw, Sparkles } from 'lucide-vue-next'

import DashboardRenderer from '@/components/dashboard/DashboardRenderer.vue'
import NarrativePanel from '@/components/dashboard/NarrativePanel.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ToggleSwitch from '@/components/common/ToggleSwitch.vue'
import SourcePicker from '@/components/sources/SourcePicker.vue'

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
    <section class="no-print reveal rounded-panel border border-line bg-card p-4 shadow-soft sm:p-6">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-extrabold text-ink">کدام سند را تحلیل کنیم؟</h2>
          <p class="mt-0.5 text-xs text-ink-mute">روی یک PDF بزنید تا گزارش آن باز شود یا ساخته شود.</p>
        </div>
        <BaseButton :disabled="!selected || busy" :loading="store.generating" class="max-sm:w-full" @click="generate">
          <component :is="dashboard ? RefreshCw : BarChart3" class="size-4" aria-hidden="true" />
          {{ dashboard ? 'بازسازی گزارش' : 'ساخت گزارش' }}
        </BaseButton>
      </div>

      <SourcePicker v-model="selected" :items="eligible" :disabled="busy" label="انتخاب سند برای داشبورد">
        <template #empty>
          <p class="col-span-full rounded-control bg-card-soft px-4 py-6 text-center text-sm text-ink-soft">
            هنوز سندی آماده نیست. ابتدا در بخش اسناد یک PDF بارگذاری و «استخراج متن» را اجرا کنید.
          </p>
        </template>
      </SourcePicker>

      <div class="fold" :data-open="!!selected">
        <div>
          <div class="space-y-4 border-t border-line pt-5 mt-5">
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
                class="w-full resize-none rounded-control border border-line bg-card px-3 py-3 text-sm leading-7 text-ink outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-ink-mute focus:border-brand focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--brand)_20%,transparent)]"
              />
              <div class="mt-2 flex flex-wrap gap-2">
                <button
                  v-for="hint in DASHBOARD_HINTS"
                  :key="hint"
                  type="button"
                  class="rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft transition-[border-color,color,background-color,transform] duration-300 hover:border-brand hover:bg-brand-soft hover:text-brand-ink active:scale-95"
                  @click="instruction = hint"
                >
                  {{ hint }}
                </button>
              </div>
            </div>

            <ToggleSwitch
              v-model="useLlm"
              label="تحلیل هوشمند با مدل زبانی"
              hint="اگر خاموش باشد، فقط نمودارها و جدول‌های قطعیِ استخراج‌شده از خود جدول‌ها ساخته می‌شود (سریع‌تر و بدون مدل)."
            />
          </div>
        </div>
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
      <div class="mx-auto flex max-w-md flex-col items-center gap-3">
        <div class="h-1.5 w-full overflow-hidden rounded-full bg-line">
          <div class="bar-stripes h-full rounded-full bg-brand transition-[width] duration-[1500ms] ease-out" :style="{ width: store.generating ? `${25 + stage * 25}%` : '40%' }" />
        </div>
        <Transition name="swap" mode="out-in">
          <p :key="store.generating ? stage : 'load'" class="flex items-center justify-center gap-2 text-center text-sm text-ink-soft">
            <Sparkles class="size-4 animate-pulse text-brand-ink" aria-hidden="true" />
            {{ store.generating ? STAGES[stage] : 'در حال دریافت گزارش…' }}
          </p>
        </Transition>
      </div>
    </div>

    <!-- خطا -->
    <div v-else-if="store.error" class="rounded-panel bg-danger-soft px-5 py-4 text-sm leading-7 text-danger" role="alert" dir="auto">
      {{ store.error }}
    </div>

    <!-- سندی انتخاب نشده -->
    <EmptyState
      v-else-if="!selected"
      :icon="FileText"
      :title="eligible.length ? 'یک سند را انتخاب کنید' : 'هنوز سندی آماده نیست'"
      :description="
        eligible.length
          ? 'برای هر PDF با هر موضوعی می‌توانید داشبوردی از شاخص‌ها، نمودارها و تحلیل بسازید.'
          : 'ابتدا یک PDF بارگذاری کنید و مرحلهٔ «استخراج متن» را اجرا کنید.'
      "
    >
      <BaseButton v-if="!eligible.length" to="/sources">بارگذاری سند</BaseButton>
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
      <section class="reveal rounded-panel border border-line bg-card p-4 shadow-soft sm:p-6">
        <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-mute">
          <span class="inline-flex items-center gap-1.5" dir="auto">
            <FileText class="size-4" aria-hidden="true" />
            {{ dashboard.meta?.source_file || selectedName || 'سند انتخاب‌شده' }}
          </span>
          <span v-if="dashboard.meta?.page_count">{{ faNumber(dashboard.meta.page_count) }} صفحه</span>
          <span v-if="dashboard.meta?.table_count != null">{{ faNumber(dashboard.meta.table_count) }} جدول</span>
          <span
            class="rounded-full px-2 py-0.5"
            :class="dashboard.meta?.llm_used ? 'bg-brand-soft text-brand-ink' : 'bg-card-soft text-ink-mute'"
          >
            {{ dashboard.meta?.llm_used ? 'با تحلیل هوشمند' : 'بدون مدل زبانی' }}
          </span>

          <div class="no-print ms-auto flex items-center gap-1">
            <button type="button" class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-card-soft hover:text-ink active:scale-95" @click="downloadJson">
              <Braces class="size-4" aria-hidden="true" /> JSON
            </button>
            <button type="button" class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-card-soft hover:text-ink" @click="printPage">
              <Printer class="size-4" aria-hidden="true" /> چاپ / PDF
            </button>
          </div>
        </div>

        <h2 class="mt-4 text-lg font-extrabold leading-9 text-ink sm:text-xl" dir="auto">{{ dashboard.title || 'داشبورد' }}</h2>
        <p v-if="dashboard.summary" class="mt-3 max-w-4xl text-sm leading-8 text-ink-soft" dir="auto">{{ dashboard.summary }}</p>
      </section>

      <DashboardRenderer :dashboard="dashboard" />
      <NarrativePanel :dashboard="dashboard" />
    </template>
  </div>
</template>
