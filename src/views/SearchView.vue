<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Search, ScanSearch } from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SourcePicker from '@/components/sources/SourcePicker.vue'
import { searchApi } from '@/api/search.api'
import { errorMessage } from '@/api/http'
import { useSourcesStore } from '@/stores/sources'
import { faNumber } from '@/utils/format'

const route = useRoute()
const sources = useSourcesStore()

const query = ref('')
const sourceId = ref(null)
const topK = ref(5)
const loading = ref(false)
const error = ref('')
const result = ref(null)

const TOP_K_OPTIONS = [3, 5, 8, 10]
const similarity = (d) => Math.max(0, Math.min(100, Math.round((1 - d) * 100)))

async function run() {
  if (!query.value.trim() || loading.value) return
  loading.value = true
  error.value = ''
  try {
    result.value = await searchApi.query({ query: query.value.trim(), sourceId: sourceId.value, topK: topK.value })
  } catch (e) {
    error.value = errorMessage(e)
    result.value = null
  } finally {
    loading.value = false
  }
}

// جست‌وجوی نوار بالا با ?q= به این صفحه می‌آید و خودکار اجرا می‌شود.
function fromRoute() {
  const q = route.query.q
  if (typeof q === 'string' && q.trim()) {
    query.value = q
    run()
  }
}
onMounted(fromRoute)
watch(() => route.query.q, fromRoute)
</script>

<template>
  <div class="space-y-6">
    <form class="reveal space-y-5 rounded-panel border border-line bg-card p-4 shadow-soft sm:p-6" @submit.prevent="run">
      <div class="flex flex-col gap-3 sm:flex-row">
        <div class="group relative flex-1">
          <label for="s-query" class="sr-only">عبارت جست‌وجو</label>
          <Search class="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-ink-mute transition-colors group-focus-within:text-brand-ink" aria-hidden="true" />
          <input
            id="s-query"
            v-model="query"
            dir="auto"
            maxlength="4000"
            placeholder="مثلاً: افت فروش در فوریه"
            class="h-12 w-full rounded-2xl border border-line bg-card ps-12 pe-4 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-ink-mute focus:border-brand focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--brand)_20%,transparent)]"
          />
        </div>
        <BaseButton type="submit" size="lg" :loading="loading" :disabled="!query.trim()" class="max-sm:w-full">جست‌وجو</BaseButton>
      </div>

      <div>
        <p class="mb-2 text-sm font-bold text-ink">در کدام سند جست‌وجو کنیم؟</p>
        <SourcePicker
          v-model="sourceId"
          :items="sources.items"
          allow-all
          compact
          label="محدودهٔ جست‌وجو"
          class="[&>div:last-child]:grid-cols-1 [&>div:last-child]:sm:grid-cols-2 [&>div:last-child]:xl:grid-cols-3"
        />
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <span id="topk-label" class="text-sm font-bold text-ink">تعداد نتایج</span>
        <div class="relative inline-flex rounded-full bg-card-soft p-1" role="radiogroup" aria-labelledby="topk-label">
          <label v-for="n in TOP_K_OPTIONS" :key="n" class="relative">
            <input v-model.number="topK" type="radio" name="topk" :value="n" class="peer sr-only" />
            <span
              class="block min-w-11 rounded-full px-3 py-1.5 text-center text-xs font-bold tabular-nums text-ink-soft transition-[background-color,color,box-shadow] duration-300 peer-checked:bg-brand peer-checked:text-on-brand peer-checked:shadow-soft peer-focus-visible:outline-2 peer-focus-visible:outline-brand"
            >
              {{ faNumber(n) }}
            </span>
          </label>
        </div>
      </div>
    </form>

    <Transition name="swap">
      <p v-if="error" class="rounded-control bg-danger-soft px-4 py-3 text-sm leading-7 text-danger" role="alert">{{ error }}</p>
    </Transition>

    <div v-if="loading" class="space-y-3" role="status" aria-label="در حال جست‌وجو">
      <div v-for="n in 3" :key="n" class="skeleton h-28 rounded-panel" />
    </div>

    <EmptyState
      v-else-if="!result && !error"
      :icon="ScanSearch"
      title="بر اساس معنا جست‌وجو کنید"
      description="عبارت لازم نیست دقیقاً در متن آمده باشد؛ نزدیک‌ترین بخش‌ها از نظر مفهوم پیدا می‌شوند."
    />

    <section v-else-if="result" aria-live="polite">
      <p class="mb-4 text-sm text-ink-soft">
        {{ faNumber(result.result_count) }} نتیجه برای «<span dir="auto" class="font-bold text-ink">{{ result.query }}</span>»
      </p>

      <EmptyState v-if="!result.results.length" title="نتیجه‌ای پیدا نشد" description="عبارت دیگری را امتحان کنید یا مطمئن شوید سند بردارسازی شده است." />

      <ol v-else class="space-y-3">
        <li
          v-for="(r, i) in result.results"
          :key="r.chunk_id"
          class="reveal lift rounded-panel border border-line bg-card p-4 shadow-soft sm:p-5"
          :style="{ '--i': i }"
        >
          <div class="mb-3 flex flex-wrap items-center gap-2 text-xs text-ink-mute">
            <span class="grid size-6 place-items-center rounded-full bg-brand-soft font-bold text-brand-ink">{{ faNumber(i + 1) }}</span>
            <span class="rounded-full bg-lapis-soft px-2 py-0.5 font-medium text-lapis">سند {{ faNumber(r.metadata.source_id) }}</span>
            <span>صفحهٔ {{ faNumber(r.metadata.page_number) }}</span>
            <span class="flex items-center gap-2 max-sm:w-full sm:ms-auto">
              شباهت
              <span class="h-1.5 w-24 overflow-hidden rounded-full bg-line">
                <span class="animate-grow block h-full origin-right rounded-full bg-brand" :style="{ width: similarity(r.distance) + '%', animationDelay: `${i * 80 + 300}ms` }" />
              </span>
              <span class="font-bold tabular-nums text-ink-soft">{{ faNumber(similarity(r.distance)) }}٪</span>
            </span>
          </div>
          <p class="text-sm leading-8 text-ink-soft" dir="auto">{{ r.text }}</p>
        </li>
      </ol>
    </section>
  </div>
</template>
