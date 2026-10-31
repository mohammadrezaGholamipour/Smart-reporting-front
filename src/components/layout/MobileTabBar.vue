<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { NAV_ITEMS, isActivePath } from '@/utils/nav'

const route = useRoute()
const activeIndex = computed(() => NAV_ITEMS.findIndex((item) => isActivePath(item, route.path)))
</script>

<template>
  <nav
    data-chrome
    class="glass fixed inset-x-3 bottom-3 z-40 rounded-3xl border p-1.5 shadow-lift md:hidden"
    style="margin-bottom: env(safe-area-inset-bottom)"
    aria-label="منوی اصلی"
  >
    <div class="relative grid grid-cols-4">
      <!-- قرص طلایی که زیر آیتم فعال می‌لغزد (صفحه راست‌به‌چپ است) -->
      <span
        class="absolute inset-y-0 start-0 w-1/4 p-0.5 transition-[transform,opacity] duration-500 ease-[var(--e-spring)]"
        :style="{ transform: `translateX(${-Math.max(activeIndex, 0) * 100}%)`, opacity: activeIndex < 0 ? 0 : 1 }"
        aria-hidden="true"
      >
        <span class="block size-full rounded-2xl bg-brand-soft ring-1 ring-brand/40" />
      </span>

      <RouterLink v-for="(item, i) in NAV_ITEMS" :key="item.to" v-slot="{ href, navigate }" :to="item.to" custom>
        <a
          :href="href"
          class="group relative flex h-14 flex-col items-center justify-center gap-0.5 rounded-2xl text-[0.7rem] font-medium transition-colors duration-300 active:scale-95"
          :class="activeIndex === i ? 'text-brand-ink' : 'text-ink-mute'"
          :aria-current="activeIndex === i ? 'page' : undefined"
          @click="navigate"
        >
          <component
            :is="item.icon"
            class="size-5 transition-transform duration-500 ease-[var(--e-spring)]"
            :class="activeIndex === i && '-translate-y-0.5 scale-110'"
            aria-hidden="true"
          />
          <span>{{ item.short }}</span>
        </a>
      </RouterLink>
    </div>
  </nav>
</template>
