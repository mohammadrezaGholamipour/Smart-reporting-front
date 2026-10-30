<script setup>
import { computed } from 'vue'
import { Sparkles, User, RotateCcw, Copy } from 'lucide-vue-next'
import { useClipboard } from '@vueuse/core'
import { toast } from 'vue-sonner'
import SourceCitations from './SourceCitations.vue'
import { renderMarkdown } from '@/utils/markdown'

const props = defineProps({ message: { type: Object, required: true } })
const emit = defineEmits(['retry'])

const isUser = computed(() => props.message.role === 'user')
const html = computed(() => (isUser.value ? '' : renderMarkdown(props.message.content)))

const { copy } = useClipboard()
async function copyText() {
  await copy(props.message.content)
  toast.success('متن کپی شد.')
}
</script>

<template>
  <div class="flex gap-3" :class="isUser && 'flex-row-reverse'">
    <div
      class="grid size-9 shrink-0 place-items-center rounded-xl"
      :class="isUser ? 'bg-lapis text-white' : 'bg-turquoise-soft text-turquoise'"
      aria-hidden="true"
    >
      <User v-if="isUser" class="size-4" />
      <Sparkles v-else class="size-4" />
    </div>

    <div
      class="max-w-[85%] rounded-2xl px-4 py-3"
      :class="
        isUser
          ? 'rounded-ss-sm bg-lapis text-white'
          : message.error
            ? 'rounded-ss-sm border border-danger/30 bg-danger-soft text-danger'
            : 'rounded-ss-sm border border-line bg-card shadow-sm'
      "
    >
      <p v-if="isUser" class="whitespace-pre-wrap text-sm leading-8" dir="auto">{{ message.content }}</p>
      <div v-else-if="message.error" class="text-sm leading-7" dir="auto">{{ message.content }}</div>
      <div v-else class="prose-fa" dir="auto" v-html="html" />

      <p v-if="message.understood" class="mt-2 text-xs leading-6 text-ink-mute" dir="auto">
        برداشت از پیام شما: «{{ message.understood }}»
      </p>

      <SourceCitations v-if="!isUser && !message.error" :sources="message.sources" />

      <div v-if="!isUser" class="mt-2 flex items-center gap-1">
        <button
          v-if="message.error && message.retry"
          class="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium hover:bg-danger/10"
          @click="emit('retry', message)"
        >
          <RotateCcw class="size-3.5" aria-hidden="true" /> تلاش دوباره
        </button>
        <button
          v-else-if="!message.error"
          class="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-ink-mute hover:bg-card-soft hover:text-ink"
          @click="copyText"
        >
          <Copy class="size-3.5" aria-hidden="true" /> کپی
        </button>
      </div>
    </div>
  </div>
</template>
