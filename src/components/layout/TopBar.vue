<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { onKeyStroke } from '@vueuse/core'
import { Search } from 'lucide-vue-next'
import SarayeIraniLogo from '@/components/common/SarayeIraniLogo.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'

defineProps({ title: { type: String, default: '' }, subtitle: { type: String, default: '' } })

const router = useRouter()
const query = ref('')
const input = ref(null)

function submit() {
  const q = query.value.trim()
  if (!q) return
  router.push({ name: 'search', query: { q } })
  query.value = ''
  input.value?.blur()
}

// کلید «/» مثل بیشتر برنامه‌ها، فوکوس را به جست‌وجو می‌برد.
onKeyStroke('/', (e) => {
  const tag = document.activeElement?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return
  e.preventDefault()
  input.value?.focus()
})
</script>

<template>
  <header
    data-chrome
    class="glass sticky top-0 z-30 flex h-[4.5rem] items-center gap-3 border-b px-4 pt-[env(safe-area-inset-top)] sm:px-6 lg:px-8"
  >
    <!-- موبایل: نشان برند (منوی کناری در موبایل نیست) -->
    <RouterLink to="/" class="md:hidden" aria-label="صفحهٔ اصلی"><SarayeIraniLogo compact /></RouterLink>

    <div class="min-w-0 flex-1">
      <Transition name="swap" mode="out-in">
        <div :key="title">
          <h1 class="truncate text-base font-extrabold leading-7 text-ink sm:text-lg">{{ title }}</h1>
          <p v-if="subtitle" class="hidden truncate text-xs text-ink-mute sm:block">{{ subtitle }}</p>
        </div>
      </Transition>
    </div>

    <form class="group relative hidden w-72 lg:block xl:w-96" role="search" @submit.prevent="submit">
      <label for="global-search" class="sr-only">جست‌وجو در اسناد</label>
      <Search class="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-mute transition-colors group-focus-within:text-brand-ink" aria-hidden="true" />
      <input
        id="global-search"
        ref="input"
        v-model="query"
        dir="auto"
        placeholder="جست‌وجوی معنایی در اسناد…"
        class="h-11 w-full rounded-xl border border-line bg-card ps-10 pe-10 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-ink-mute focus:border-brand focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--brand)_20%,transparent)]"
      />
      <kbd class="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 rounded-md border border-line bg-card-soft px-1.5 text-[0.7rem] text-ink-mute transition-opacity group-focus-within:opacity-0">/</kbd>
    </form>

    <ThemeToggle />
  </header>
</template>
