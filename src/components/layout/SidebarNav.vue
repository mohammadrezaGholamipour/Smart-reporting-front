<script setup>
import { computed } from 'vue'
import { useMediaQuery, useStorage } from '@vueuse/core'
import { ChevronsRight } from 'lucide-vue-next'
import SarayeIraniLogo from '@/components/common/SarayeIraniLogo.vue'
import { NAV_ITEMS } from '@/utils/nav'
import { useHealth } from '@/composables/useHealth'
import { useSourcesStore } from '@/stores/sources'
import { faNumber } from '@/utils/format'

const sources = useSourcesStore()
const { online } = useHealth()

// auto: روی تبلت جمع‌شده و روی دسکتاپ باز؛ با انتخاب کاربر برای همیشه ثابت می‌شود.
const pref = useStorage('sr-sidebar', 'auto')
const isWide = useMediaQuery('(min-width: 1280px)')
const collapsed = computed(() => pref.value === 'closed' || (pref.value === 'auto' && !isWide.value))
const toggle = () => (pref.value = collapsed.value ? 'open' : 'closed')

const status = computed(() => {
  if (online.value === null) return { label: 'در حال بررسی اتصال…', dot: 'bg-ink-mute', ping: false }
  return online.value
    ? { label: 'سرور متصل است', dot: 'bg-ok', ping: true }
    : { label: 'اتصال به سرور برقرار نیست', dot: 'bg-danger', ping: false }
})

const badge = (item) => (item.badge === 'ready' && sources.readyCount ? faNumber(sources.readyCount) : null)
</script>

<template>
  <aside
    data-chrome
    class="glass relative flex h-dvh flex-col border-e transition-[width] duration-500 ease-[var(--e-out)]"
    :class="collapsed ? 'w-[4.75rem]' : 'w-72'"
    aria-label="منوی اصلی"
  >
    <!-- دکمهٔ جمع/باز کردن روی لبهٔ منو -->
    <button
      type="button"
      class="absolute -end-3.5 top-9 z-10 grid size-7 place-items-center rounded-full border border-line bg-card text-ink-soft shadow-soft transition-[transform,color,border-color] duration-300 hover:scale-110 hover:border-brand hover:text-brand-ink"
      :aria-label="collapsed ? 'باز کردن منو' : 'جمع کردن منو'"
      :aria-expanded="!collapsed"
      @click="toggle"
    >
      <ChevronsRight class="size-4 transition-transform duration-500 ease-[var(--e-spring)]" :class="collapsed ? 'rotate-0' : 'rotate-180'" aria-hidden="true" />
    </button>

    <div class="flex h-[4.5rem] items-center border-b border-line px-[0.95rem]">
      <RouterLink to="/" aria-label="سرای ایرانی؛ صفحهٔ اصلی"><SarayeIraniLogo :compact="collapsed" /></RouterLink>
    </div>

    <nav class="scroll-thin flex-1 space-y-1.5 px-3 py-5" :class="collapsed ? 'overflow-visible' : 'overflow-y-auto'">
      <RouterLink
        v-for="(item, i) in NAV_ITEMS"
        :key="item.to"
        v-slot="{ href, navigate, isActive, isExactActive }"
        :to="item.to"
        custom
      >
        <a
          :href="href"
          class="group reveal relative flex h-12 items-center gap-3.5 rounded-xl px-3.5 text-sm font-medium transition-[background-color,color,transform] duration-300 active:scale-[0.97]"
          :class="(item.exact ? isExactActive : isActive) ? 'bg-brand-soft text-brand-ink' : 'text-ink-soft hover:bg-card-soft hover:text-ink'"
          :style="{ '--i': i + 1 }"
          :aria-current="(item.exact ? isExactActive : isActive) ? 'page' : undefined"
          @click="navigate"
        >
          <!-- نشانگر فعال: از لبهٔ منو بیرون می‌آید -->
          <span
            class="absolute inset-y-2.5 -end-3 w-1 origin-center rounded-s-full bg-brand transition-transform duration-500 ease-[var(--e-spring)]"
            :class="(item.exact ? isExactActive : isActive) ? 'scale-y-100' : 'scale-y-0'"
            aria-hidden="true"
          />
          <component
            :is="item.icon"
            class="size-5 shrink-0 transition-transform duration-300 ease-[var(--e-spring)] group-hover:scale-110 group-hover:-rotate-6"
            aria-hidden="true"
          />
          <span class="truncate transition-[opacity,transform] duration-300" :class="collapsed ? 'pointer-events-none translate-x-2 opacity-0' : 'opacity-100'">
            {{ item.name }}
          </span>
          <span
            v-if="badge(item) && !collapsed"
            class="ms-auto animate-pop rounded-full bg-brand px-2 py-0.5 text-[0.7rem] font-bold text-on-brand"
            :title="`${badge(item)} سند آمادهٔ پرسش`"
          >
            {{ badge(item) }}
          </span>

          <!-- راهنمای کنار آیکون در حالت جمع‌شده -->
          <span
            v-if="collapsed"
            role="tooltip"
            class="pointer-events-none absolute start-full z-50 ms-4 translate-x-2 whitespace-nowrap rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-paper opacity-0 shadow-lift transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
          >
            {{ item.name }}
          </span>
        </a>
      </RouterLink>
    </nav>

    <div class="border-t border-line p-3">
      <div
        class="flex items-center gap-3 overflow-hidden rounded-xl bg-card-soft p-3 transition-[padding] duration-300"
        :class="collapsed && 'justify-center px-0'"
        role="status"
        :title="status.label"
      >
        <span class="relative flex size-2.5 shrink-0" aria-hidden="true">
          <span v-if="status.ping" class="absolute inline-flex size-full animate-ping rounded-full opacity-60" :class="status.dot" />
          <span class="relative inline-flex size-2.5 rounded-full" :class="status.dot" />
        </span>
        <div v-if="!collapsed" class="min-w-0 animate-fade">
          <p class="truncate text-xs font-bold text-ink">{{ status.label }}</p>
          <p class="truncate text-[0.7rem] text-ink-mute">
            {{ sources.readyCount ? `${faNumber(sources.readyCount)} سند آمادهٔ پرسش` : 'هنوز سندی آماده نیست' }}
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>
