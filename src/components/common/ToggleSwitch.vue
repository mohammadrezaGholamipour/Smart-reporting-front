<script setup>
defineProps({
  modelValue: Boolean,
  label: { type: String, required: true },
  hint: { type: String, default: '' },
  disabled: Boolean,
})
defineEmits(['update:modelValue'])
</script>

<template>
  <label class="group flex cursor-pointer items-start gap-3" :class="disabled && 'pointer-events-none opacity-50'">
    <input
      type="checkbox"
      role="switch"
      class="peer sr-only"
      :checked="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', $event.target.checked)"
    />
    <!-- ریل و دستگیره؛ دستگیره با فنر حرکت می‌کند -->
    <span
      class="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-line transition-colors duration-300 peer-checked:bg-brand peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand peer-checked:[&>span]:-translate-x-5"
      aria-hidden="true"
    >
      <span
        class="absolute start-0.5 top-0.5 size-5 translate-x-0 rounded-full bg-white shadow-md transition-transform duration-500 ease-[var(--e-spring)] group-active:scale-90"
      />
    </span>
    <span class="min-w-0">
      <span class="block text-sm font-medium text-ink">{{ label }}</span>
      <span v-if="hint" class="mt-0.5 block text-xs leading-6 text-ink-mute">{{ hint }}</span>
    </span>
  </label>
</template>
