<script setup>
import { ref, nextTick } from 'vue'
import { SendHorizontal, Square } from 'lucide-vue-next'

defineProps({ sending: Boolean })
const emit = defineEmits(['send', 'stop'])

const text = ref('')
const area = ref(null)

function resize() {
  const el = area.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 180) + 'px'
}

function submit() {
  if (!text.value.trim()) return
  emit('send', text.value)
  text.value = ''
  nextTick(resize)
}

// Enter ارسال، Shift+Enter خط جدید؛ در حین ورودی IME (کیبورد فارسی/عربی) ارسال نمی‌شود.
function onKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault()
    submit()
  }
}

defineExpose({ focus: () => area.value?.focus(), fill: (t) => ((text.value = t), nextTick(resize)) })
</script>

<template>
  <form
    class="flex items-end gap-2 rounded-2xl border border-line bg-card p-2 shadow-sm transition-colors focus-within:border-turquoise"
    @submit.prevent="submit"
  >
    <label for="chat-input" class="sr-only">پرسش خود را بنویسید</label>
    <textarea
      id="chat-input"
      ref="area"
      v-model="text"
      rows="1"
      maxlength="4000"
      dir="auto"
      placeholder="سؤال خود را دربارهٔ اسناد بنویسید…"
      class="max-h-44 min-h-10 flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-7 text-ink outline-none placeholder:text-ink-mute"
      @input="resize"
      @keydown="onKeydown"
    />

    <button
      v-if="sending"
      type="button"
      class="grid size-10 shrink-0 place-items-center rounded-xl bg-danger-soft text-danger"
      aria-label="توقف"
      @click="emit('stop')"
    >
      <Square class="size-4 fill-current" />
    </button>
    <button
      v-else
      type="submit"
      class="grid size-10 shrink-0 place-items-center rounded-xl bg-turquoise text-white transition-opacity disabled:opacity-40"
      :disabled="!text.trim()"
      aria-label="ارسال"
    >
      <SendHorizontal class="size-4 -scale-x-100" />
    </button>
  </form>
</template>
