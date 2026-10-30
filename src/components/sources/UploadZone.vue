<script setup>
import { ref } from 'vue'
import { UploadCloud } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { MAX_UPLOAD_MB } from '@/utils/constants'
import { faNumber } from '@/utils/format'

defineProps({ progress: { type: Number, default: null } })
const emit = defineEmits(['select'])

const input = ref(null)
const dragging = ref(false)

function validate(file) {
  if (!file) return false
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    toast.error('فقط فایل PDF پذیرفته می‌شود.')
    return false
  }
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    toast.error(`حجم فایل نباید بیشتر از ${faNumber(MAX_UPLOAD_MB)} مگابایت باشد.`)
    return false
  }
  return true
}

function handleFiles(list) {
  for (const file of Array.from(list || [])) if (validate(file)) emit('select', file)
}

function onDrop(e) {
  dragging.value = false
  handleFiles(e.dataTransfer?.files)
}
function onChange(e) {
  handleFiles(e.target.files)
  e.target.value = ''
}
</script>

<template>
  <div
    class="relative overflow-hidden rounded-panel border-2 border-dashed px-6 py-10 text-center transition-colors"
    :class="dragging ? 'border-turquoise bg-turquoise-soft' : 'border-line bg-card hover:border-turquoise/60'"
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="onDrop"
  >
    <input ref="input" type="file" accept="application/pdf,.pdf" multiple class="sr-only" @change="onChange" />

    <div class="mx-auto grid size-14 place-items-center rounded-2xl bg-turquoise-soft text-turquoise">
      <UploadCloud class="size-7" aria-hidden="true" />
    </div>

    <template v-if="progress === null">
      <p class="mt-4 text-base font-bold text-ink">فایل PDF را اینجا رها کنید</p>
      <p class="mt-1 text-sm text-ink-soft">
        یا
        <button class="font-medium text-turquoise underline underline-offset-4" @click="input.click()">از دستگاه انتخاب کنید</button>
        · حداکثر {{ faNumber(MAX_UPLOAD_MB) }} مگابایت
      </p>
    </template>

    <template v-else>
      <p class="mt-4 text-base font-bold text-ink">در حال بارگذاری…</p>
      <div class="mx-auto mt-3 h-2 w-full max-w-sm overflow-hidden rounded-full bg-line" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">
        <div class="h-full rounded-full bg-turquoise transition-[width] duration-200" :style="{ width: progress + '%' }" />
      </div>
      <p class="mt-2 text-sm text-ink-soft">{{ faNumber(progress) }}٪</p>
    </template>
  </div>
</template>
