<script setup>
defineProps({ compact: Boolean })
</script>

<template>
  <div class="group flex select-none items-center gap-3">
    <!-- نشان: ستارهٔ هشت‌پر (خاتم) که با هاور می‌چرخد -->
    <div class="relative grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-soft ring-1 ring-brand/40 transition-transform duration-500 ease-[var(--e-spring)] group-hover:scale-105">
      <svg class="size-7 text-brand transition-transform duration-[900ms] ease-out group-hover:rotate-[135deg]" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="6" y="6" width="20" height="20" rx="2.5" fill="currentColor" opacity="0.92" />
        <rect x="6" y="6" width="20" height="20" rx="2.5" transform="rotate(45 16 16)" fill="currentColor" />
        <circle cx="16" cy="16" r="4.2" class="fill-card-soft" />
        <circle cx="16" cy="16" r="1.7" fill="currentColor" />
      </svg>
    </div>

    <div class="min-w-0 overflow-hidden transition-[max-width,opacity] duration-500" :class="compact ? 'max-w-0 opacity-0' : 'max-w-44 opacity-100'">
      <p class="whitespace-nowrap text-lg font-black leading-6 text-ink">سرای ایرانی</p>
      <p class="whitespace-nowrap text-[0.7rem] leading-5 text-ink-mute">گزارش‌یار هوشمند</p>
    </div>
  </div>
</template>
