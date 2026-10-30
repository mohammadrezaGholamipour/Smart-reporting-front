<script setup>
import { ref, watch, nextTick } from 'vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  open: Boolean,
  title: { type: String, default: 'آیا مطمئن هستید؟' },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'تأیید' },
  danger: Boolean,
  loading: Boolean,
})
const emit = defineEmits(['confirm', 'cancel'])

const dialog = ref(null)

// از عنصر بومی <dialog> استفاده می‌کنیم: مدیریت فوکوس و کلید Esc رایگان است.
watch(
  () => props.open,
  async (isOpen) => {
    await nextTick()
    if (isOpen && !dialog.value?.open) dialog.value?.showModal()
    if (!isOpen && dialog.value?.open) dialog.value.close()
  },
)
</script>

<template>
  <dialog
    ref="dialog"
    class="m-auto w-[min(92vw,26rem)] rounded-panel border border-line bg-card p-0 text-ink shadow-2xl backdrop:bg-night/60 backdrop:backdrop-blur-sm"
    @cancel.prevent="emit('cancel')"
    @click.self="emit('cancel')"
  >
    <div class="p-6">
      <h2 class="text-lg font-bold">{{ title }}</h2>
      <p v-if="message" class="mt-2 text-sm leading-7 text-ink-soft">{{ message }}</p>
      <div class="mt-6 flex justify-end gap-2">
        <BaseButton variant="ghost" @click="emit('cancel')">انصراف</BaseButton>
        <BaseButton :variant="danger ? 'danger' : 'primary'" :loading="loading" @click="emit('confirm')">
          {{ confirmLabel }}
        </BaseButton>
      </div>
    </div>
  </dialog>
</template>
