<script setup>
defineProps({
  icon: { type: [Object, Function], default: null },
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <div
    class="animate-pop flex flex-col items-center justify-center gap-3 rounded-panel border border-dashed border-line bg-card/60 px-6 py-12 text-center sm:py-14"
  >
    <div v-if="icon" class="animate-float relative grid size-16 place-items-center rounded-3xl bg-brand-soft text-brand-ink">
      <span class="absolute inset-0 rounded-3xl border border-brand/30" aria-hidden="true" />
      <component :is="icon" class="size-8" aria-hidden="true" />
    </div>
    <h3 class="text-lg font-extrabold text-ink">{{ title }}</h3>
    <p v-if="description" class="max-w-md text-sm leading-7 text-ink-soft">{{ description }}</p>
    <div v-if="$slots.default" class="mt-2 flex flex-wrap justify-center gap-2"><slot /></div>
  </div>
</template>
