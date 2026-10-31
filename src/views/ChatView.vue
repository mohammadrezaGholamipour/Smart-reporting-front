<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { MessagesSquare, Trash2, SlidersHorizontal, X, FileText, Layers, Sparkles } from 'lucide-vue-next'
import ChatMessage from '@/components/chat/ChatMessage.vue'
import ChatComposer from '@/components/chat/ChatComposer.vue'
import ChatSettings from '@/components/chat/ChatSettings.vue'
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
const currentSource = computed(() => sources.items.find((s) => s.id === chat.settings.sourceId))

async function scrollToEnd() {
  await nextTick()
  scroller.value?.scrollTo({ top: scroller.value.scrollHeight, behavior: 'smooth' })
}
watch(() => [chat.messages.length, chat.sending], scrollToEnd, { immediate: true, flush: 'post' })

function ask(q) {
  composer.value?.fill(q)
  composer.value?.focus()
}
</script>

<template>
  <div class="grid gap-5 lg:grid-cols-[1fr_21rem] lg:gap-6">
    <section
      class="flex h-[calc(100dvh-12.5rem)] min-h-[26rem] flex-col overflow-hidden rounded-panel border border-line bg-card/50 shadow-soft md:h-[calc(100dvh-9.5rem)] lg:h-[calc(100dvh-11rem)]"
    >
      <div ref="scroller" class="scroll-thin flex-1 space-y-5 overflow-y-auto p-4 sm:p-6" aria-live="polite">
        <!-- شروع گفتگو -->
        <div v-if="!chat.messages.length" class="flex min-h-full flex-col items-center justify-center py-6 text-center">
          <div class="animate-float relative grid size-20 place-items-center rounded-[1.75rem] bg-brand-soft text-brand-ink ring-1 ring-brand/30">
            <MessagesSquare class="size-9" aria-hidden="true" />
            <Sparkles class="absolute -end-2 -top-2 size-5 animate-pulse text-brand" aria-hidden="true" />
          </div>
          <h2 class="reveal mt-5 text-xl font-extrabold text-ink" style="--i: 1">از اسناد خود بپرسید</h2>
          <p class="reveal mt-2 max-w-md text-sm leading-7 text-ink-soft" style="--i: 2">
            {{
              noReadySources
                ? 'هنوز سندی آمادهٔ پرسش نیست. ابتدا یک PDF بارگذاری و آماده‌سازی کنید.'
                : 'پاسخ‌ها فقط از محتوای اسناد ساخته می‌شوند و منبع هر پاسخ قابل مشاهده است.'
            }}
          </p>

          <BaseButton v-if="noReadySources" to="/sources" class="reveal mt-5" style="--i: 3">رفتن به اسناد</BaseButton>
          <div v-else class="mt-6 grid w-full max-w-2xl gap-2.5 sm:grid-cols-2">
            <button
              v-for="(q, i) in SUGGESTED_QUESTIONS"
              :key="q"
              class="reveal lift rounded-2xl border border-line bg-card px-4 py-3 text-start text-sm leading-7 text-ink-soft transition-colors hover:text-ink active:scale-[0.98]"
              :style="{ '--i': i + 3 }"
              @click="ask(q)"
            >
              {{ q }}
            </button>
          </div>
        </div>

        <ChatMessage v-for="m in chat.messages" :key="m.id" :message="m" @retry="chat.retry" />

        <div v-if="chat.sending" class="animate-fade flex items-center gap-3" role="status" aria-label="در حال نوشتن پاسخ">
          <div class="grid size-9 place-items-center rounded-xl bg-brand-soft ring-1 ring-brand/30">
            <span class="flex gap-1">
              <i v-for="n in 3" :key="n" class="typing-dot size-1.5 rounded-full bg-brand" />
            </span>
          </div>
          <span class="text-sm text-ink-mute">در حال جست‌وجو در اسناد…</span>
        </div>
      </div>

      <div class="border-t border-line bg-card/60 p-3 sm:p-4">
        <ChatComposer ref="composer" :sending="chat.sending" @send="chat.send" @stop="chat.stop" />
        <div class="mt-2 flex items-center justify-between gap-2 px-1">
          <!-- موبایل: سند فعلی؛ با لمس، تنظیمات باز می‌شود -->
          <button
            class="inline-flex min-w-0 max-w-[65%] items-center gap-1.5 rounded-full bg-card-soft px-3 py-1.5 text-xs text-ink-soft transition-[background-color,transform] hover:bg-brand-soft active:scale-95 lg:hidden"
            @click="settingsOpen = true"
          >
            <component :is="currentSource ? FileText : Layers" class="size-3.5 shrink-0 text-brand-ink" aria-hidden="true" />
            <span class="truncate" dir="auto">{{ currentSource ? currentSource.name : 'همهٔ اسناد' }}</span>
            <SlidersHorizontal class="size-3.5 shrink-0" aria-hidden="true" />
          </button>
          <button
            v-if="chat.messages.length"
            class="ms-auto inline-flex items-center gap-1.5 text-xs text-ink-mute transition-colors hover:text-danger"
            @click="chat.clear()"
          >
            <Trash2 class="size-3.5" aria-hidden="true" /> گفتگوی جدید
          </button>
        </div>
      </div>
    </section>

    <!-- تنظیمات دسکتاپ -->
    <aside
      class="reveal scroll-thin hidden h-fit max-h-[calc(100dvh-11rem)] overflow-y-auto rounded-panel border border-line bg-card p-5 shadow-soft lg:sticky lg:top-24 lg:block"
      style="--i: 2"
      aria-label="تنظیمات پرسش"
    >
      <h2 class="mb-4 text-base font-extrabold">تنظیمات پرسش</h2>
      <ChatSettings />
    </aside>

    <!-- تنظیمات موبایل: ورق پایین‌آمده -->
    <Teleport to="body">
      <Transition name="sheet">
        <div
          v-if="settingsOpen"
          class="fixed inset-0 z-50 flex items-end bg-night/60 backdrop-blur-sm lg:hidden"
          @click.self="settingsOpen = false"
        >
          <div class="sheet-panel max-h-[88dvh] w-full overflow-y-auto rounded-t-[1.75rem] border-t border-line bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-lift">
            <div class="mx-auto mb-4 h-1.5 w-10 rounded-full bg-line" aria-hidden="true" />
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-base font-extrabold">تنظیمات پرسش</h2>
              <button class="grid size-9 place-items-center rounded-full bg-card-soft transition-transform active:scale-90" aria-label="بستن" @click="settingsOpen = false">
                <X class="size-4" />
              </button>
            </div>
            <ChatSettings />
            <BaseButton block class="mt-5" @click="settingsOpen = false">تأیید</BaseButton>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
