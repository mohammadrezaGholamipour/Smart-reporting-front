<script setup>
/**
 * انتخاب سند به‌صورت باکس: برای هر PDF یک کارت قابل‌انتخاب.
 * زیر کاپوت یک گروه radio بومی است؛ پس کلیدهای جهت‌دار، Tab و صفحه‌خوان رایگان کار می‌کنند.
 */
import { computed, ref, useId } from 'vue'
import { Check, FileText, Layers, Search } from 'lucide-vue-next'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { faDate, faNumber } from '@/utils/format'

const props = defineProps({
  modelValue: { type: [Number, String], default: null },
  items: { type: Array, default: () => [] },
  allowAll: Boolean, // کارت «همهٔ اسناد» (مقدار null)
  allLabel: { type: String, default: 'همهٔ اسناد' },
  allHint: { type: String, default: 'جست‌وجو در تمام فایل‌ها' },
  compact: Boolean, // نسخهٔ فشرده برای ستون کناری
  disabled: Boolean,
  label: { type: String, default: 'انتخاب سند' },
})
const emit = defineEmits(['update:modelValue'])

const name = `pick-${useId()}`
const filter = ref('')

const title = (s) => (s.name || s.original_filename || 'سند بدون نام').replace(/\.pdf$/i, '')
const showFilter = computed(() => props.items.length > 6)
const list = computed(() => {
  const q = filter.value.trim().toLowerCase()
  return q ? props.items.filter((s) => title(s).toLowerCase().includes(q)) : props.items
})
</script>

<template>
  <div>
    <div v-if="showFilter" class="relative mb-3">
      <label :for="`${name}-filter`" class="sr-only">فیلتر اسناد</label>
      <Search class="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-mute" aria-hidden="true" />
      <input
        :id="`${name}-filter`"
        v-model="filter"
        dir="auto"
        placeholder="جست‌وجو در نام فایل‌ها…"
        class="h-10 w-full rounded-control border border-line bg-card ps-9 pe-3 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-ink-mute focus:border-brand focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--brand)_20%,transparent)]"
      />
    </div>

    <div
      role="radiogroup"
      :aria-label="label"
      class="scroll-thin -m-1 grid gap-3 p-1"
      :class="[
        compact ? 'max-h-80 gap-2 overflow-y-auto' : 'sm:grid-cols-2 xl:grid-cols-3',
        !compact && items.length > 6 && 'max-h-[34rem] overflow-y-auto',
      ]"
    >
      <!-- همهٔ اسناد -->
      <label v-if="allowAll" class="reveal block" style="--i: 0">
        <input
          type="radio"
          class="sr-only"
          :name="name"
          :disabled="disabled"
          :checked="modelValue == null"
          @change="emit('update:modelValue', null)"
        />
        <span class="pick-face flex items-center gap-3" :class="compact ? 'p-3' : 'p-4'">
          <span class="pick-icon grid shrink-0 place-items-center bg-card-soft text-ink-soft" :class="compact ? 'size-9 rounded-xl' : 'size-11 rounded-2xl'">
            <Layers :class="compact ? 'size-4' : 'size-5'" aria-hidden="true" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-bold text-ink">{{ allLabel }}</span>
            <span class="block truncate text-xs text-ink-mute">{{ allHint }}</span>
          </span>
          <span class="pick-check grid size-6 shrink-0 place-items-center rounded-full bg-brand text-on-brand" aria-hidden="true">
            <Check class="size-3.5" stroke-width="3" />
          </span>
        </span>
      </label>

      <!-- هر PDF یک باکس -->
      <label v-for="(s, i) in list" :key="s.id" class="reveal block" :style="{ '--i': i + 1 }">
        <input
          type="radio"
          class="sr-only"
          :name="name"
          :disabled="disabled"
          :checked="modelValue === s.id"
          @change="emit('update:modelValue', s.id)"
        />

        <!-- نسخهٔ فشرده -->
        <span v-if="compact" class="pick-face flex items-center gap-3 p-3">
          <span class="pick-icon grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-ink">
            <FileText class="size-4" aria-hidden="true" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-bold text-ink" dir="auto" :title="title(s)">{{ title(s) }}</span>
            <span class="mt-0.5 flex items-center gap-2 text-xs text-ink-mute">
              <StatusBadge :status="s.status" class="!px-2 !py-0 !text-[0.65rem]" />
              <span v-if="s.page_count">{{ faNumber(s.page_count) }} صفحه</span>
            </span>
          </span>
          <span class="pick-check grid size-6 shrink-0 place-items-center rounded-full bg-brand text-on-brand" aria-hidden="true">
            <Check class="size-3.5" stroke-width="3" />
          </span>
        </span>

        <!-- نسخهٔ کامل -->
        <span v-else class="pick-face flex h-full flex-col gap-4 p-4">
          <span class="flex items-start gap-3">
            <span class="pick-icon relative grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand-ink">
              <FileText class="size-6" aria-hidden="true" />
              <span class="absolute -bottom-1.5 rounded-md bg-ink px-1 text-[0.55rem] font-black leading-4 text-paper" aria-hidden="true">PDF</span>
            </span>
            <span class="min-w-0 flex-1 pt-0.5">
              <span class="line-clamp-2 block break-words text-sm font-bold leading-6 text-ink" dir="auto" :title="title(s)">{{ title(s) }}</span>
              <span class="mt-1 block text-xs text-ink-mute">
                {{ faDate(s.created_at) }}
                <template v-if="s.page_count"> · {{ faNumber(s.page_count) }} صفحه</template>
              </span>
            </span>
            <span class="pick-check grid size-7 shrink-0 place-items-center rounded-full bg-brand text-on-brand shadow-soft" aria-hidden="true">
              <Check class="size-4" stroke-width="3" />
            </span>
          </span>
          <span class="mt-auto flex items-center justify-between gap-2">
            <StatusBadge :status="s.status" />
          </span>
        </span>
      </label>

      <p v-if="!list.length && filter" class="col-span-full py-6 text-center text-sm text-ink-mute">فایلی با این نام پیدا نشد.</p>
      <slot v-if="!items.length && !allowAll" name="empty" />
    </div>
  </div>
</template>
