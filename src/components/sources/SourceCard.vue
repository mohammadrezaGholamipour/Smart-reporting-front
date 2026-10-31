<script setup>
import { computed, ref } from 'vue'
import { FileText, Trash2, Zap, MessageSquare, AlertCircle, BarChart3 } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'
import ToggleSwitch from '@/components/common/ToggleSwitch.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import PipelineStepper from './PipelineStepper.vue'
import { useSourcesStore } from '@/stores/sources'
import { useChatStore } from '@/stores/chat'
import { useDashboardStore } from '@/stores/dashboard'
import { faNumber, faDate } from '@/utils/format'

const props = defineProps({ source: { type: Object, required: true } })
const emit = defineEmits(['delete'])

const store = useSourcesStore()
const chat = useChatStore()
const dashboard = useDashboardStore()
const router = useRouter()

const withPageindex = ref(false)
const busyStep = computed(() => store.busy[props.source.id] || null)
const error = computed(() => store.stepError[props.source.id])
const isReady = computed(() => props.source.status === 'embedded')
const anyBusy = computed(() => !!busyStep.value || props.source.status === 'processing')

function askAbout() {
  chat.settings = { ...chat.settings, sourceId: props.source.id }
  router.push('/chat')
}

// داشبورد همان سند در صفحهٔ اصلی انتخاب و (اگر قبلاً ساخته شده باشد) نمایش داده می‌شود.
function openDashboard() {
  dashboard.sourceId = props.source.id
  router.push('/')
}
</script>

<template>
  <article class="lift rounded-panel border border-line bg-card p-4 shadow-soft sm:p-5">
    <header class="flex items-start gap-3 sm:gap-4">
      <div class="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand-ink">
        <FileText class="size-6" aria-hidden="true" />
        <span class="absolute -bottom-1.5 rounded-md bg-ink px-1 text-[0.55rem] font-black leading-4 text-paper" aria-hidden="true">PDF</span>
      </div>

      <div class="min-w-0 flex-1">
        <h3 class="truncate text-base font-bold text-ink" :title="source.name" dir="auto">{{ source.name?.replace(/\.pdf$/i, '') }}</h3>
        <p class="mt-0.5 text-xs text-ink-mute">
          {{ faDate(source.created_at) }}
          <template v-if="source.page_count"> · {{ faNumber(source.page_count) }} صفحه</template>
        </p>
      </div>

      <StatusBadge :status="source.status" class="hidden sm:inline-flex" />
    </header>
    <StatusBadge :status="source.status" class="mt-3 sm:hidden" />

    <div class="mt-6 px-1 sm:px-2">
      <PipelineStepper
        :is-done="(key) => store.isStepDone(source, key)"
        :busy-step="busyStep"
        :error-step="error?.step ?? null"
        @run="(key) => store.runStep(source.id, key)"
      />
    </div>

    <Transition name="swap">
      <p
        v-if="error || source.error_message"
        class="mt-4 flex items-start gap-2 rounded-control bg-danger-soft px-3 py-2 text-xs leading-6 text-danger"
        role="alert"
      >
        <AlertCircle class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span dir="auto">{{ error?.message || source.error_message }}</span>
      </p>
    </Transition>

    <footer class="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
      <BaseButton v-if="!isReady" size="sm" :loading="anyBusy" @click="store.runAll(source.id, { withPageindex })">
        <Zap class="size-4" aria-hidden="true" />
        آماده‌سازی خودکار
      </BaseButton>
      <template v-else>
        <BaseButton size="sm" @click="askAbout">
          <MessageSquare class="size-4" aria-hidden="true" />
          پرسش از این سند
        </BaseButton>
        <BaseButton size="sm" variant="secondary" @click="openDashboard">
          <BarChart3 class="size-4" aria-hidden="true" />
          داشبورد و گزارش
        </BaseButton>
      </template>

      <BaseButton class="ms-auto" size="sm" variant="ghost" :disabled="anyBusy" aria-label="حذف سند" @click="emit('delete', source)">
        <Trash2 class="size-4" aria-hidden="true" />
        <span class="hidden sm:inline">حذف</span>
      </BaseButton>

      <div v-if="!isReady" class="w-full pt-1">
        <ToggleSwitch v-model="withPageindex" label="ایندکس صفحه‌ای هم ساخته شود" />
      </div>
    </footer>
  </article>
</template>
