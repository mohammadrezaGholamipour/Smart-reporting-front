<script setup>
import { computed } from 'vue'
import { Check } from 'lucide-vue-next'
import SourcePicker from '@/components/sources/SourcePicker.vue'
import { RETRIEVAL_MODES } from '@/utils/constants'
import { useSourcesStore } from '@/stores/sources'
import { useChatStore } from '@/stores/chat'
import { faNumber } from '@/utils/format'

const sources = useSourcesStore()
const chat = useChatStore()

const needsSource = computed(() => chat.settings.mode === 'pageindex' && chat.settings.sourceId == null)
</script>

<template>
  <div class="space-y-6 text-sm">
    <div>
      <p id="cs-source" class="mb-2 font-bold text-ink">سند مورد پرسش</p>
      <SourcePicker
        v-model="chat.settings.sourceId"
        :items="sources.items"
        allow-all
        compact
        label="سند مورد پرسش"
      />
    </div>

    <fieldset>
      <legend class="mb-2 font-bold text-ink">روش بازیابی</legend>
      <div class="space-y-2">
        <label v-for="m in RETRIEVAL_MODES" :key="m.value" class="block">
          <input v-model="chat.settings.mode" type="radio" name="mode" :value="m.value" class="sr-only" />
          <span class="pick-face flex items-start gap-3 p-3">
            <span class="min-w-0 flex-1">
              <span class="block font-bold text-ink">{{ m.label }}</span>
              <span class="mt-0.5 block text-xs leading-6 text-ink-soft">{{ m.hint }}</span>
            </span>
            <span class="pick-check mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand text-on-brand" aria-hidden="true">
              <Check class="size-3" stroke-width="3" />
            </span>
          </span>
        </label>
      </div>
      <Transition name="swap">
        <p v-if="needsSource" class="mt-2 rounded-control bg-saffron-soft px-3 py-2 text-xs leading-6 text-saffron" role="alert">
          برای ایندکس صفحه‌ای باید یک سند مشخص انتخاب کنید.
        </p>
      </Transition>
    </fieldset>

    <div class="fold" :data-open="chat.settings.mode === 'embedding'">
      <div>
        <label for="cs-topk" class="mb-2 flex items-center justify-between font-bold text-ink">
          تعداد قطعه‌های بازیابی‌شده
          <span class="rounded-full bg-brand-soft px-2.5 text-xs font-bold tabular-nums text-brand-ink">{{ faNumber(chat.settings.topK) }}</span>
        </label>
        <input id="cs-topk" v-model.number="chat.settings.topK" type="range" min="1" max="10" step="1" class="h-2 w-full" />
        <p class="mt-1 text-xs text-ink-mute">عدد بزرگ‌تر یعنی زمینهٔ بیشتر، اما پاسخ کندتر.</p>
      </div>
    </div>
  </div>
</template>
