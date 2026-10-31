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
  <label
    class="group relative block cursor-pointer overflow-hidden rounded-panel border-2 border-dashed px-5 py-9 text-center transition-[border-color,background-color,transform,box-shadow] duration-500 ease-[var(--e-out)] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand sm:py-11"
    :class="
      dragging
        ? 'scale-[1.015] border-brand bg-brand-soft shadow-glow'
        : 'border-line bg-card/70 hover:border-brand/60 hover:bg-brand-soft/40'
    "
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="onDrop"
  >
    <input ref="input" type="file" accept="application/pdf,.pdf" multiple class="sr-only" @change="onChange" />

    <!-- حلقه‌های موج هنگام کشیدن فایل -->
    <span v-if="dragging" class="pointer-events-none absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-brand/20" aria-hidden="true" />

    <div
      class="relative mx-auto grid size-16 place-items-center rounded-3xl bg-brand-soft text-brand-ink ring-1 ring-brand/30 transition-transform duration-500 ease-[var(--e-spring)]"
      :class="dragging ? '-translate-y-2 scale-110' : 'group-hover:-translate-y-1 group-hover:rotate-[-4deg]'"
    >
      <UploadCloud class="size-8" aria-hidden="true" />
    </div>

    <Transition name="swap" mode="out-in">
      <div v-if="progress !== null" key="uploading" class="relative">
        <p class="mt-4 text-base font-bold text-ink">در حال بارگذاری…</p>
        <div
          class="mx-auto mt-3 h-2.5 w-full max-w-sm overflow-hidden rounded-full bg-line"
          role="progressbar"
          :aria-valuenow="progress"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div class="bar-stripes h-full rounded-full bg-brand transition-[width] duration-300 ease-out" :style="{ width: progress + '%' }" />
        </div>
        <p class="mt-2 text-sm font-medium tabular-nums text-ink-soft">{{ faNumber(progress) }}٪</p>
      </div>

      <div v-else-if="dragging" key="drop" class="relative">
        <p class="mt-4 text-base font-extrabold text-brand-ink">رها کنید تا بارگذاری شود</p>
      </div>

      <div v-else key="idle" class="relative">
        <p class="mt-4 text-base font-extrabold text-ink">فایل PDF را اینجا رها کنید</p>
        <p class="mt-1 text-sm leading-7 text-ink-soft">
          یا <span class="font-bold text-brand-ink underline decoration-brand/50 underline-offset-4">از دستگاه انتخاب کنید</span>
          <span class="hidden sm:inline"> · </span><span class="block sm:inline">حداکثر {{ faNumber(MAX_UPLOAD_MB) }} مگابایت برای هر فایل</span>
        </p>
      </div>
    </Transition>
  </label>
</template>
