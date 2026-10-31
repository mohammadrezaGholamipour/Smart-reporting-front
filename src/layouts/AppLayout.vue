<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import SidebarNav from '@/components/layout/SidebarNav.vue'
import TopBar from '@/components/layout/TopBar.vue'
import MobileTabBar from '@/components/layout/MobileTabBar.vue'
import { useSourcesStore } from '@/stores/sources'

const route = useRoute()
const sources = useSourcesStore()

// فهرست اسناد در چند صفحه (منو، چت، جست‌وجو) لازم است؛ یک بار در ریشه بارگیری می‌شود.
onMounted(() => sources.fetchAll())
</script>

<template>
  <div class="min-h-dvh md:flex">
    <!-- تبلت و دسکتاپ: منوی کناری؛ موبایل: منوی شناور پایین -->
    <div data-chrome class="sticky top-0 z-40 hidden h-dvh shrink-0 md:block">
      <SidebarNav />
    </div>

    <div class="flex min-w-0 flex-1 flex-col">
      <TopBar :title="route.meta.title" :subtitle="route.meta.subtitle" />

      <main class="mx-auto w-full max-w-7xl flex-1 px-4 pb-28 pt-5 sm:px-6 md:pb-10 lg:px-8 lg:pt-8">
        <RouterView v-slot="{ Component, route: r }">
          <Transition name="page" mode="out-in">
            <component :is="Component" :key="r.path" />
          </Transition>
        </RouterView>
      </main>
    </div>

    <MobileTabBar />
  </div>
</template>
