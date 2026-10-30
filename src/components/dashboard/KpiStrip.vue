
<script setup>
import { computed } from 'vue'

const props = defineProps({
  component: {
    type: Object,
    required: true,
  },
})

const payload = computed(() =>
  props.component.data ??
  props.component.config ??
  props.component
)

const items = computed(() => {
  const source =
    payload.value.items ??
    payload.value.values ??
    payload.value.metrics ??
    payload.value.data ??
    []

  if (Array.isArray(source)) return source

  if (source && typeof source === 'object') {
    return Object.entries(source).map(([key, value]) => {
      if (value && typeof value === 'object') {
        return { key, ...value }
      }

      return { key, value }
    })
  }

  return []
})

function getLabel(item) {
  return item.label ?? item.title ?? item.name ?? item.key ?? 'شاخص'
}

function getValue(item) {
  return item.value ?? item.amount ?? item.total ?? '—'
}

function getDescription(item) {
  return item.description ?? item.subtitle ?? item.change ?? ''
}
</script>

<template>
  <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <article
      v-for="(item, index) in items"
      :key="item.id ?? item.key ?? index"
      class="rounded-panel border border-line bg-card p-5"
    >
      <p class="text-sm text-ink-mute">
        {{ getLabel(item) }}
      </p>

      <p class="mt-3 text-2xl font-bold text-ink" dir="auto">
        {{ getValue(item) }}
        <span v-if="item.unit" class="text-sm font-normal text-ink-mute">
          {{ item.unit }}
        </span>
      </p>

      <p
        v-if="getDescription(item)"
        class="mt-2 text-xs text-ink-soft"
      >
        {{ getDescription(item) }}
      </p>
    </article>
  </section>
</template>
