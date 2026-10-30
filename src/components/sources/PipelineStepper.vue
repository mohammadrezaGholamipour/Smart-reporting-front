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
    <li v-for="(step, i) in PIPELINE_STEPS" :key="step.key" class="relative flex flex-1 flex-col items-center text-center">
      <!-- خط اتصال به مرحلهٔ بعد (در RTL به سمت چپ) -->
      <span
        v-if="i < PIPELINE_STEPS.length - 1"
        class="absolute top-4 end-[-50%] h-0.5 w-full"
        :class="isDone(step.key) ? 'bg-turquoise' : 'bg-line'"
        aria-hidden="true"
      />

      <button
        class="relative z-10 grid size-8 place-items-center rounded-full border-2 text-xs font-bold transition-colors"
        :class="[
          errorStep === step.key
            ? 'border-danger bg-danger-soft text-danger'
            : isDone(step.key)
              ? 'border-turquoise bg-turquoise text-white'
              : busyStep === step.key
                ? 'pulse-ring border-turquoise bg-card text-turquoise'
                : 'border-line bg-card text-ink-mute hover:border-turquoise hover:text-turquoise',
        ]"
        :disabled="!!busyStep"
        :title="isDone(step.key) ? `اجرای دوبارهٔ «${step.label}»` : `اجرای «${step.label}»: ${step.hint}`"
        :aria-label="step.label"
        @click="$emit('run', step.key)"
      >
        <Loader2 v-if="busyStep === step.key" class="size-4 animate-spin" />
        <AlertTriangle v-else-if="errorStep === step.key" class="size-4" />
        <Check v-else-if="isDone(step.key)" class="size-4" />
        <span v-else>{{ i + 1 }}</span>
      </button>

      <span class="mt-2 text-xs leading-5" :class="isDone(step.key) ? 'text-ink' : 'text-ink-mute'">
        {{ step.label }}
        <span v-if="step.optional" class="block text-[0.65rem] text-ink-mute">اختیاری</span>
      </span>
    </li>
  </ol>
</template>
