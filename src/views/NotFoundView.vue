<script setup>
import { Compass } from 'lucide-vue-next'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseButton from '@/components/common/BaseButton.vue'
</script>

<template>
  <EmptyState :icon="Compass" title="این صفحه وجود ندارد" description="آدرس را بررسی کنید یا به داشبورد برگردید.">
    <BaseButton to="/">بازگشت به داشبورد</BaseButton>
  </EmptyState>
</template>
