<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { MessagesSquare, Trash2, SlidersHorizontal, X } from 'lucide-vue-next'
import ChatMessage from '@/components/chat/ChatMessage.vue'
import ChatComposer from '@/components/chat/ChatComposer.vue'
import ChatSettings from '@/components/chat/ChatSettings.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useChatStore } from '@/stores/chat'
import { useSourcesStore } from '@/stores/sources'
import { SUGGESTED_QUESTIONS } from '@/utils/constants'

const chat = useChatStore()
const sources = useSourcesStore()

const scroller = ref(null)
const composer = ref(null)
const settingsOpen = ref(false)

const noReadySources = computed(() => sources.loaded && sources.readyCount === 0)

async function scrollToEnd() {
  await nextTick()
  scroller.value?.scrollTo({ top: scroller.value.scrollHeight, behavior: 'smooth' })
}
watch(() => [chat.messages.length, chat.sending], scrollToEnd, { immediate: true, flush: 'post' })
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[1fr_20rem]">
    <section class="flex h-[calc(100dvh-11rem)] min-h-[28rem] flex-col rounded-panel border border-line bg-paper/40">
      <div ref="scroller" class="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6" aria-live="polite">
        <div v-if="!chat.messages.length" class="flex h-full items-center justify-center">
          <EmptyState
            :icon="MessagesSquare"
            title="از اسناد خود بپرسید"
            :description="
              noReadySources
                ? 'هنوز سندی آمادهٔ پرسش نیست. ابتدا یک PDF بارگذاری و آماده‌سازی کنید.'
                : 'پاسخ‌ها فقط از محتوای اسناد ساخته می‌شوند و منبع هر پاسخ قابل مشاهده است.'
            "
          >
            <RouterLink v-if="noReadySources" to="/sources">
              <BaseButton>رفتن به اسناد</BaseButton>
            </RouterLink>
            <button
              v-for="q in SUGGESTED_QUESTIONS"
              v-else
              :key="q"
              class="rounded-full border border-line bg-card px-4 py-2 text-sm text-ink-soft transition-colors hover:border-turquoise hover:text-turquoise"
              @click="composer.fill(q), composer.focus()"
            >
              {{ q }}
            </button>
          </EmptyState>
        </div>

        <ChatMessage v-for="m in chat.messages" :key="m.id" :message="m" @retry="chat.retry" />

        <div v-if="chat.sending" class="flex items-center gap-3" role="status" aria-label="در حال نوشتن پاسخ">
          <div class="grid size-9 place-items-center rounded-xl bg-turquoise-soft">
            <span class="flex gap-1">
              <i v-for="n in 3" :key="n" class="typing-dot size-1.5 rounded-full bg-turquoise" />
            </span>
          </div>
          <span class="text-sm text-ink-mute">در حال جست‌وجو در اسناد…</span>
        </div>
      </div>

      <div class="border-t border-line p-3 sm:p-4">
        <ChatComposer ref="composer" :sending="chat.sending" @send="chat.send" @stop="chat.stop" />
        <div class="mt-2 flex items-center justify-between px-1">
          <button class="inline-flex items-center gap-1.5 text-xs text-ink-mute hover:text-ink lg:hidden" @click="settingsOpen = true">
            <SlidersHorizontal class="size-3.5" aria-hidden="true" /> تنظیمات
          </button>
          <button
            v-if="chat.messages.length"
            class="ms-auto inline-flex items-center gap-1.5 text-xs text-ink-mute hover:text-danger"
            @click="chat.clear()"
          >
            <Trash2 class="size-3.5" aria-hidden="true" /> پاک کردن گفتگو
          </button>
        </div>
      </div>
    </section>

    <!-- تنظیمات دسکتاپ -->
    <aside class="hidden h-fit rounded-panel border border-line bg-card p-5 lg:block" aria-label="تنظیمات پرسش">
      <h2 class="mb-4 text-base font-bold">تنظیمات پرسش</h2>
      <ChatSettings />
    </aside>

    <!-- تنظیمات موبایل -->
    <Teleport to="body">
      <div v-if="settingsOpen" class="fixed inset-0 z-50 flex items-end bg-night/60 backdrop-blur-sm lg:hidden" @click.self="settingsOpen = false">
        <div class="max-h-[85dvh] w-full overflow-y-auto rounded-t-3xl bg-card p-5">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-base font-bold">تنظیمات پرسش</h2>
            <button class="grid size-9 place-items-center rounded-full bg-card-soft" aria-label="بستن" @click="settingsOpen = false">
              <X class="size-4" />
            </button>
          </div>
          <ChatSettings />
        </div>
      </div>
    </Teleport>
  </div>
</template>
