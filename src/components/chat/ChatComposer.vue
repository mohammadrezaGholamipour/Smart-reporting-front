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
    class="flex items-end gap-2 rounded-3xl border border-line bg-card p-2 shadow-soft transition-[border-color,box-shadow] duration-300 focus-within:border-brand focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--brand)_20%,transparent)]"
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
      class="max-h-44 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm leading-7 text-ink outline-none placeholder:text-ink-mute"
      @input="resize"
      @keydown="onKeydown"
    />

    <Transition name="swap" mode="out-in">
      <button
        v-if="sending"
        key="stop"
        type="button"
        class="grid size-11 shrink-0 place-items-center rounded-2xl bg-danger-soft text-danger transition-transform duration-200 active:scale-90"
        aria-label="توقف"
        @click="emit('stop')"
      >
        <Square class="size-4 fill-current" />
      </button>
      <button
        v-else
        key="send"
        type="submit"
        class="group grid size-11 shrink-0 place-items-center rounded-2xl bg-brand text-on-brand shadow-soft transition-[transform,opacity,box-shadow] duration-300 hover:shadow-glow active:scale-90 disabled:opacity-40 disabled:shadow-none"
        :disabled="!text.trim()"
        aria-label="ارسال"
      >
        <SendHorizontal class="size-[1.15rem] -scale-x-100 transition-transform duration-300 group-enabled:group-hover:-translate-x-0.5" />
      </button>
    </Transition>
  </form>
</template>
