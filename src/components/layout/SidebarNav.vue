<template>
  <aside 
    :class="[
      'relative flex flex-col h-screen transition-all duration-500 ease-in-out glass-panel border-l border-amber-500/20 z-30 select-none',
      isCollapsed ? 'w-20' : 'w-72'
    ]"
  >
    <div class="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <button 
      @click="toggleSidebar"
      class="absolute -left-3.5 top-8 w-7 h-7 rounded-full bg-slate-900 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg hover:scale-110 hover:border-amber-300 transition-all duration-300 z-50 cursor-pointer"
      :title="isCollapsed ? 'باز کردن منو' : 'بستن منو'"
    >
      <svg 
        class="w-4 h-4 transition-transform duration-500" 
        :class="{ 'rotate-180': isCollapsed }" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/>
      </svg>
    </button>

    <div class="p-5 flex items-center border-b border-amber-500/15 overflow-hidden">
      <div class="flex items-center gap-3.5 min-w-max">
        <SarayeIraniLogo />
      </div>
    </div>

    <nav class="flex-1 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        v-slot="{ isActive }"
        class="block group relative"
      >
        <div
          :class="[
            'flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-300 relative overflow-hidden',
            isActive 
              ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent text-amber-300 border border-amber-500/30 font-bold shadow-lg shadow-amber-500/5' 
              : 'text-slate-400 hover:text-amber-200 hover:bg-slate-800/50 border border-transparent'
          ]"
        >
          <div 
            v-if="isActive" 
            class="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-7 rounded-l-full bg-gradient-to-b from-amber-300 to-amber-500 shadow-[0_0_12px_rgba(229,169,60,0.8)]"
          ></div>

          <div :class="[
            'w-6 h-6 transition-transform duration-300 group-hover:scale-110 flex-shrink-0 flex items-center justify-center',
            isActive ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(229,169,60,0.5)]' : 'text-slate-400 group-hover:text-amber-300'
          ]">
            <svg v-if="item.icon === 'dashboard'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
            <svg v-else-if="item.icon === 'document'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <svg v-else-if="item.icon === 'chat'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>

          <span v-if="!isCollapsed" class="text-sm font-medium whitespace-nowrap transition-opacity duration-300">
            {{ item.name }}
          </span>

          <span 
            v-if="item.badge && !isCollapsed" 
            class="mr-auto px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30"
          >
            {{ item.badge }}
          </span>
        </div>

        <div 
          v-if="isCollapsed" 
          class="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-500/30 text-amber-200 text-xs font-medium whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50"
        >
          {{ item.name }}
        </div>
      </router-link>
    </nav>

    <div class="p-4 border-t border-amber-500/15">
      <div 
        :class="[
          'rounded-xl bg-slate-900/80 border border-amber-500/20 p-3 transition-all duration-300 flex items-center gap-3',
          isCollapsed ? 'justify-center' : 'justify-between'
        ]"
      >
        <div class="flex items-center gap-2.5">
          <span class="relative flex h-3 w-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div v-if="!isCollapsed" class="flex flex-col">
            <span class="text-xs font-bold text-slate-200">هوش مصنوعی فعال</span>
            <span class="text-[10px] text-slate-400">شعبه مرکزی</span>
          </div>
        </div>
        <span v-if="!isCollapsed" class="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">v2.5</span>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import SarayeIraniLogo from '@/components/common/SarayeIraniLogo.vue'

const isCollapsed = ref(false)
const toggleSidebar = () => { isCollapsed.value = !isCollapsed.value }

const navItems = [
  { name: 'داشبورد مدیریتی', path: '/dashboard', icon: 'dashboard', badge: 'زنده' },
  { name: 'مدیریت اسناد PDF', path: '/sources', icon: 'document', badge: 'مدیر' },
  { name: 'چت و تحلیل هوشمند', path: '/chat', icon: 'chat' },
  { name: 'جستجوی داده‌ها', path: '/search', icon: 'search' }
]
</script>
