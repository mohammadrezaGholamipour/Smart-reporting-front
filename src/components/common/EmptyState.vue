<script setup>
defineProps({
  icon: { type: [Object, Function], default: null },
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 rounded-panel border border-dashed border-line bg-card/60 px-6 py-14 text-center">
    <div v-if="icon" class="grid size-14 place-items-center rounded-2xl bg-turquoise-soft text-turquoise">
      <component :is="icon" class="size-7" aria-hidden="true" />
    </div>
    <h3 class="text-lg font-bold text-ink">{{ title }}</h3>
    <p v-if="description" class="max-w-md text-sm text-ink-soft">{{ description }}</p>
    <div v-if="$slots.default" class="mt-2 flex flex-wrap justify-center gap-2"><slot /></div>
  </div>
</template>
