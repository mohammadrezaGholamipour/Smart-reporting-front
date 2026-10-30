<template>
  <header class="sticky top-0 z-40 w-full glass-panel border-b border-amber-500/20 px-6 py-3 flex items-center justify-between backdrop-blur-xl">
    <div class="flex items-center gap-6">
      <SarayeIraniLogo />
      
      <!-- Interactive Custom Search Bar -->
      <div class="hidden md:flex items-center relative w-80">
        <input
          type="text"
          placeholder="جستجوی هوشمند در داده‌های سرای ایرانی..."
          class="custom-input w-full pr-10 pl-4 text-xs placeholder-slate-400"
        />
        <svg class="w-4 h-4 text-amber-400 absolute right-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
    </div>

    <!-- Quick Controls & Profile -->
    <div class="flex items-center gap-4">
      <button class="relative p-2.5 rounded-xl bg-slate-800/60 border border-amber-500/20 text-amber-300 hover:border-amber-400 transition-all duration-300 group">
        <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
        <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400"></span>
      </button>

      <div class="flex items-center gap-3 pr-3 border-r border-slate-700/60">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-md shadow-amber-500/20">
          <div class="w-full h-full rounded-[10px] bg-slate-900 flex items-center justify-center text-amber-300 font-bold text-sm">
            س‌ا
          </div>
        </div>
        <div class="hidden lg:flex flex-col">
          <span class="text-xs font-bold text-slate-100">مدیر تحلیل داده</span>
          <span class="text-[10px] text-amber-400/80">شعبه مرکزی سرای ایرانی</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import SarayeIraniLogo from '@/components/common/SarayeIraniLogo.vue'
</script>
