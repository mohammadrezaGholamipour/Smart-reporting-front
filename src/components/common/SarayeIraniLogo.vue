<template>
  <div class="flex items-center gap-3 cursor-pointer group select-none">
    <div class="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/25 via-red-500/15 to-amber-600/35 border border-amber-500/50 group-hover:border-amber-400 transition-all duration-500 group-hover:scale-105 shadow-lg shadow-amber-500/15">
      <div class="absolute inset-0 rounded-xl border border-dashed border-amber-400/40 animate-[spin_12s_linear_infinite]"></div>
      <svg class="w-6 h-6 text-amber-400 group-hover:rotate-6 transition-transform duration-300 filter drop-shadow-[0_0_8px_rgba(229,169,60,0.6)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3L2 12h3v8h14v-8h3L12 3zM12 7a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
    </div>
    <div class="flex flex-col">
      <div class="flex items-center gap-1.5">
        <span class="text-xl font-black tracking-tight text-gold-gradient drop-shadow-sm group-hover:tracking-normal transition-all duration-300">
          سرای ایرانی
        </span>
        <span class="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
          هوشمند
        </span>
      </div>
      <span class="text-[10px] text-slate-400 tracking-wider">سامانه تحلیل و گزارش‌دهی داده‌ها</span>
    </div>
  </div>
</template>

<script setup>
</script>
