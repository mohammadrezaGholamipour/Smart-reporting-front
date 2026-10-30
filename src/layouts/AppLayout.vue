<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { X } from 'lucide-vue-next'
import SidebarNav from '@/components/layout/SidebarNav.vue'
import TopBar from '@/components/layout/TopBar.vue'
import { useSourcesStore } from '@/stores/sources'

const route = useRoute()
const sources = useSourcesStore()
const drawer = ref(false)

// فهرست اسناد در چند صفحه (منو، چت، جست‌وجو) لازم است؛ یک بار در ریشه بارگیری می‌شود.
onMounted(() => sources.fetchAll())
watch(() => route.fullPath, () => (drawer.value = false))
</script>

<template>
  <div class="min-h-dvh lg:flex">
    <!-- نوار کناری دسکتاپ -->
    <div class="sticky top-0 hidden h-dvh shrink-0 lg:block">
      <SidebarNav />
    </div>

    <!-- کشوی موبایل -->
    <Transition
      enter-active-class="transition duration-200"
      leave-active-class="transition duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div v-if="drawer" class="fixed inset-0 z-40 bg-night/60 backdrop-blur-sm lg:hidden" @click="drawer = false" />
    </Transition>
    <Transition
      enter-active-class="transition duration-200"
      leave-active-class="transition duration-150"
      enter-from-class="translate-x-full"
      leave-to-class="translate-x-full"
    >
      <div v-if="drawer" class="fixed inset-y-0 right-0 z-50 lg:hidden">
        <SidebarNav @navigate="drawer = false" />
        <button
          class="absolute left-[-3rem] top-4 grid size-10 place-items-center rounded-full bg-card text-ink"
          aria-label="بستن منو"
          @click="drawer = false"
        >
          <X class="size-5" />
        </button>
      </div>
    </Transition>

    <div class="flex min-w-0 flex-1 flex-col">
      <TopBar :title="route.meta.title" :subtitle="route.meta.subtitle" @menu="drawer = true" />
      <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
