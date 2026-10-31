<script setup>
import { ref } from 'vue'
import { ChevronDown, BookOpenText } from 'lucide-vue-next'
import { faNumber } from '@/utils/format'

defineProps({ sources: { type: Array, default: () => [] } })

const open = ref(false)

// فاصلهٔ کسینوسی: هر چه کمتر، شباهت بیشتر. به درصد شباهت تبدیل می‌کنیم.
const similarity = (d) => Math.max(0, Math.min(100, Math.round((1 - d) * 100)))
</script>

<template>
  <div v-if="sources.length" class="mt-3 border-t border-line pt-3">
    <button
      class="flex w-full items-center gap-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
      :aria-expanded="open"
      @click="open = !open"
    >
      <BookOpenText class="size-4 text-brand-ink" aria-hidden="true" />
      {{ faNumber(sources.length) }} منبع استفاده شد
      <ChevronDown class="ms-auto size-4 transition-transform duration-500 ease-[var(--e-spring)]" :class="open && 'rotate-180'" aria-hidden="true" />
    </button>

    <div class="fold" :data-open="open">
      <ul class="space-y-2 pt-3">
        <li v-for="(s, i) in sources" :key="i" class="rounded-control bg-card-soft p-3">
          <div class="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-ink-mute">
            <span class="rounded-full bg-lapis-soft px-2 py-0.5 font-medium text-lapis">سند {{ faNumber(s.source_id) }}</span>
            <span>صفحهٔ {{ faNumber(s.page_number) }}</span>
            <span v-if="s.kind === 'table'" class="rounded-full bg-saffron-soft px-2 py-0.5 font-medium text-saffron">جدول</span>
            <span class="ms-auto flex items-center gap-1.5" :title="`فاصله: ${s.distance?.toFixed(3)}`">
              شباهت
              <span class="h-1.5 w-16 overflow-hidden rounded-full bg-line">
                <span class="block h-full origin-right rounded-full bg-brand transition-transform duration-700 ease-[var(--e-out)]" :style="{ width: similarity(s.distance) + '%', transform: open ? 'scaleX(1)' : 'scaleX(0)' }" />
              </span>
              {{ faNumber(similarity(s.distance)) }}٪
            </span>
          </div>
          <p class="line-clamp-4 text-sm leading-7 text-ink-soft" dir="auto">{{ s.text }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>
