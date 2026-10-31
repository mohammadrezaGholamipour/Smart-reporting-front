<script setup>
import { Check, Loader2, AlertTriangle } from 'lucide-vue-next'
import { PIPELINE_STEPS } from '@/utils/constants'

defineProps({
  isDone: { type: Function, required: true }, // (key) => boolean
  busyStep: { type: String, default: null },
  errorStep: { type: String, default: null },
})
defineEmits(['run'])
</script>

<template>
  <ol class="flex items-start" aria-label="مراحل آماده‌سازی سند">
    <li v-for="(step, i) in PIPELINE_STEPS" :key="step.key" class="relative flex min-w-0 flex-1 flex-col items-center text-center">
      <!-- خط اتصال به مرحلهٔ بعد؛ با تکمیل مرحله پر می‌شود (در RTL به سمت چپ) -->
      <span v-if="i < PIPELINE_STEPS.length - 1" class="absolute end-[-50%] top-4 h-0.5 w-full overflow-hidden rounded-full bg-line" aria-hidden="true">
        <span
          class="block h-full origin-right rounded-full bg-brand transition-transform duration-700 ease-[var(--e-out)]"
          :class="isDone(step.key) ? 'scale-x-100' : 'scale-x-0'"
        />
      </span>

      <button
        type="button"
        class="relative z-10 grid size-8 place-items-center rounded-full border-2 text-xs font-bold transition-[background-color,border-color,color,transform] duration-300 hover:scale-110 active:scale-90"
        :class="[
          errorStep === step.key
            ? 'border-danger bg-danger-soft text-danger'
            : isDone(step.key)
              ? 'border-brand bg-brand text-on-brand'
              : busyStep === step.key
                ? 'pulse-ring border-brand bg-card text-brand-ink'
                : 'border-line bg-card text-ink-mute hover:border-brand hover:text-brand-ink',
        ]"
        :disabled="!!busyStep"
        :title="isDone(step.key) ? `اجرای دوبارهٔ «${step.label}»` : `اجرای «${step.label}»: ${step.hint}`"
        :aria-label="step.label"
        @click="$emit('run', step.key)"
      >
        <Loader2 v-if="busyStep === step.key" class="size-4 animate-spin" />
        <AlertTriangle v-else-if="errorStep === step.key" class="size-4 animate-pop" />
        <Check v-else-if="isDone(step.key)" class="size-4 animate-pop" stroke-width="3" />
        <span v-else>{{ i + 1 }}</span>
      </button>

      <span class="mt-2 text-[0.7rem] leading-5 transition-colors sm:text-xs" :class="isDone(step.key) ? 'font-medium text-ink' : 'text-ink-mute'">
        {{ step.label }}
        <span v-if="step.optional" class="block text-[0.6rem] text-ink-mute">اختیاری</span>
      </span>
    </li>
  </ol>
</template>
