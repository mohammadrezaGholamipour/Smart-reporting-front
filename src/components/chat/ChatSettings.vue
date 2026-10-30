<script setup>
import { computed } from 'vue'
import { RETRIEVAL_MODES } from '@/utils/constants'
import { useSourcesStore } from '@/stores/sources'
import { useChatStore } from '@/stores/chat'
import { faNumber } from '@/utils/format'

const sources = useSourcesStore()
const chat = useChatStore()

const needsSource = computed(() => chat.settings.mode === 'pageindex' && chat.settings.sourceId == null)
const field = 'h-10 w-full rounded-control border border-line bg-card px-3 text-sm text-ink'
</script>

<template>
  <div class="space-y-5 text-sm">
    <div>
      <label for="cs-source" class="mb-1.5 block font-medium text-ink">سند مورد پرسش</label>
      <select id="cs-source" v-model="chat.settings.sourceId" :class="field">
        <option :value="null">همهٔ اسناد</option>
        <option v-for="s in sources.items" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
    </div>

    <fieldset>
      <legend class="mb-1.5 font-medium text-ink">روش بازیابی</legend>
      <div class="space-y-2">
        <label
          v-for="m in RETRIEVAL_MODES"
          :key="m.value"
          class="flex cursor-pointer items-start gap-3 rounded-control border p-3 transition-colors"
          :class="chat.settings.mode === m.value ? 'border-turquoise bg-turquoise-soft' : 'border-line bg-card hover:bg-card-soft'"
        >
          <input v-model="chat.settings.mode" type="radio" name="mode" :value="m.value" class="mt-1 accent-[var(--turquoise)]" />
          <span>
            <span class="block font-medium text-ink">{{ m.label }}</span>
            <span class="block text-xs leading-6 text-ink-soft">{{ m.hint }}</span>
          </span>
        </label>
      </div>
      <p v-if="needsSource" class="mt-2 rounded-control bg-saffron-soft px-3 py-2 text-xs leading-6 text-saffron" role="alert">
        برای ایندکس صفحه‌ای باید یک سند مشخص انتخاب کنید.
      </p>
    </fieldset>

    <div v-if="chat.settings.mode === 'embedding'">
      <label for="cs-topk" class="mb-1.5 flex items-center justify-between font-medium text-ink">
        تعداد قطعه‌های بازیابی‌شده
        <span class="rounded-full bg-card-soft px-2 text-xs text-ink-soft">{{ faNumber(chat.settings.topK) }}</span>
      </label>
      <input
        id="cs-topk"
        v-model.number="chat.settings.topK"
        type="range"
        min="1"
        max="10"
        step="1"
        class="w-full accent-[var(--turquoise)]"
      />
      <p class="mt-1 text-xs text-ink-mute">عدد بزرگ‌تر یعنی زمینهٔ بیشتر، اما پاسخ کندتر.</p>
    </div>
  </div>
</template>
