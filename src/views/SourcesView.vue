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
    <UploadZone :progress="store.uploadProgress" @select="onSelect" />

    <section aria-labelledby="sources-title">
      <div class="mb-4 flex items-center justify-between">
        <h2 id="sources-title" class="text-lg font-bold">اسناد شما</h2>
        <BaseButton variant="ghost" size="sm" :loading="store.loading" @click="store.fetchAll()">
          <RefreshCw class="size-4" aria-hidden="true" />
          به‌روزرسانی
        </BaseButton>
      </div>

      <div v-if="store.loading && !store.loaded" class="grid gap-4 lg:grid-cols-2">
        <SkeletonBlock v-for="n in 2" :key="n" class="h-56" />
      </div>

      <EmptyState
        v-else-if="!store.items.length"
        :icon="FolderOpen"
        title="هنوز سندی بارگذاری نکرده‌اید"
        description="یک فایل PDF بارگذاری کنید تا متن و جدول‌هایش استخراج و برای پرسش و پاسخ آماده شود."
      />

      <div v-else class="grid gap-4 lg:grid-cols-2">
        <SourceCard v-for="s in store.items" :key="s.id" :source="s" @delete="target = $event" />
      </div>
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
