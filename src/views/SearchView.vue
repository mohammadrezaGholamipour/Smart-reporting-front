<script setup>
import { ref } from 'vue'
import { Search, ScanSearch } from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { searchApi } from '@/api/search.api'
import { errorMessage } from '@/api/http'
import { useSourcesStore } from '@/stores/sources'
import { faNumber } from '@/utils/format'

const sources = useSourcesStore()

const query = ref('')
const sourceId = ref(null)
const topK = ref(5)
const loading = ref(false)
const error = ref('')
const result = ref(null)

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

const field = 'h-11 rounded-control border border-line bg-card px-3 text-sm text-ink'
</script>

<template>
  <div class="space-y-6">
    <form class="grid gap-3 rounded-panel border border-line bg-card p-4 sm:grid-cols-[1fr_12rem_7rem_auto]" @submit.prevent="run">
      <div class="relative">
        <label for="s-query" class="sr-only">عبارت جست‌وجو</label>
        <Search class="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-mute" aria-hidden="true" />
        <input id="s-query" v-model="query" dir="auto" :class="[field, 'w-full ps-10']" placeholder="مثلاً: افت فروش در فوریه" maxlength="4000" />
      </div>

      <div>
        <label for="s-source" class="sr-only">سند</label>
        <select id="s-source" v-model="sourceId" :class="[field, 'w-full']">
          <option :value="null">همهٔ اسناد</option>
          <option v-for="s in sources.items" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
      </div>

      <div>
        <label for="s-topk" class="sr-only">تعداد نتایج</label>
        <select id="s-topk" v-model.number="topK" :class="[field, 'w-full']">
          <option v-for="n in [3, 5, 8, 10]" :key="n" :value="n">{{ faNumber(n) }} نتیجه</option>
        </select>
      </div>

      <BaseButton type="submit" size="lg" :loading="loading" :disabled="!query.trim()">جست‌وجو</BaseButton>
    </form>

    <p v-if="error" class="rounded-control bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">{{ error }}</p>

    <EmptyState
      v-if="!result && !error && !loading"
      :icon="ScanSearch"
      title="بر اساس معنا جست‌وجو کنید"
      description="عبارت لازم نیست دقیقاً در متن آمده باشد؛ نزدیک‌ترین بخش‌ها از نظر مفهوم پیدا می‌شوند."
    />

    <section v-else-if="result" aria-live="polite">
      <p class="mb-4 text-sm text-ink-soft">
        {{ faNumber(result.result_count) }} نتیجه برای «<span dir="auto" class="font-medium text-ink">{{ result.query }}</span>»
      </p>

      <EmptyState v-if="!result.results.length" title="نتیجه‌ای پیدا نشد" description="عبارت دیگری را امتحان کنید یا مطمئن شوید سند بردارسازی شده است." />

      <ol v-else class="space-y-3">
        <li v-for="(r, i) in result.results" :key="r.chunk_id" class="rounded-panel border border-line bg-card p-5">
          <div class="mb-2 flex flex-wrap items-center gap-2 text-xs text-ink-mute">
            <span class="grid size-6 place-items-center rounded-full bg-lapis/10 font-bold text-lapis">{{ faNumber(i + 1) }}</span>
            <span class="rounded-full bg-lapis/10 px-2 py-0.5 font-medium text-lapis">سند {{ faNumber(r.metadata.source_id) }}</span>
            <span>صفحهٔ {{ faNumber(r.metadata.page_number) }}</span>
            <span class="ms-auto flex items-center gap-2">
              شباهت
              <span class="h-1.5 w-20 overflow-hidden rounded-full bg-line">
                <span class="block h-full rounded-full bg-turquoise" :style="{ width: similarity(r.distance) + '%' }" />
              </span>
              {{ faNumber(similarity(r.distance)) }}٪
            </span>
          </div>
          <p class="text-sm leading-8 text-ink-soft" dir="auto">{{ r.text }}</p>
        </li>
      </ol>
    </section>
  </div>
</template>
