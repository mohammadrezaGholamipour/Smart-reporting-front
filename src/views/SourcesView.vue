<script setup>
import { ref } from 'vue'
import { FolderOpen, RefreshCw } from 'lucide-vue-next'
import UploadZone from '@/components/sources/UploadZone.vue'
import SourceCard from '@/components/sources/SourceCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useSourcesStore } from '@/stores/sources'
import { faNumber } from '@/utils/format'

const store = useSourcesStore()

const target = ref(null)
const deleting = ref(false)

async function onSelect(file) {
  await store.upload(file)
}

async function confirmDelete() {
  deleting.value = true
  await store.remove(target.value.id)
  deleting.value = false
  target.value = null
}
</script>

<template>
  <div class="space-y-8">
    <UploadZone class="reveal" :progress="store.uploadProgress" @select="onSelect" />

    <section aria-labelledby="sources-title">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h2 id="sources-title" class="flex items-center gap-2 text-lg font-extrabold">
          اسناد شما
          <span v-if="store.items.length" class="animate-pop rounded-full bg-card-soft px-2.5 py-0.5 text-xs font-bold text-ink-soft">
            {{ faNumber(store.items.length) }}
          </span>
        </h2>
        <BaseButton variant="ghost" size="sm" :loading="store.loading" @click="store.fetchAll()">
          <RefreshCw class="size-4" aria-hidden="true" />
          به‌روزرسانی
        </BaseButton>
      </div>

      <div v-if="store.loading && !store.loaded" class="grid gap-4 lg:grid-cols-2">
        <SkeletonBlock v-for="n in 2" :key="n" class="h-60" />
      </div>

      <EmptyState
        v-else-if="!store.items.length"
        :icon="FolderOpen"
        title="هنوز سندی بارگذاری نکرده‌اید"
        description="یک فایل PDF بارگذاری کنید تا متن و جدول‌هایش استخراج و برای پرسش و پاسخ آماده شود."
      />

      <TransitionGroup v-else tag="div" name="list" class="grid gap-4 lg:grid-cols-2">
        <SourceCard
          v-for="(s, i) in store.items"
          :key="s.id"
          class="reveal"
          :style="{ '--i': i }"
          :source="s"
          @delete="target = $event"
        />
      </TransitionGroup>
    </section>

    <ConfirmDialog
      :open="!!target"
      title="حذف سند"
      :message="`«${target?.name ?? ''}» همراه با داده‌های پردازش‌شده و بردارهایش حذف می‌شود. این کار قابل بازگشت نیست.`"
      confirm-label="حذف سند"
      danger
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="target = null"
    />
  </div>
</template>
