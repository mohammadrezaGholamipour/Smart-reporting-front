<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 border-b border-amber-500/30">
      <div>
        <h2 class="text-xl font-black text-gold-gradient flex items-center gap-2">
          <svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          مدیریت هوشمند گزارش‌های PDF سرای ایرانی
        </h2>
        <p class="text-xs text-slate-400 mt-1">مدیر گرامی، سند PDF مورد نظر جهت تحلیل هوشمند توسط مدل اختصاصی را انتخاب یا بارگذاری نمایید.</p>
      </div>

      <button 
        @click="triggerFileInput"
        class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        بارگذاری PDF جدید
      </button>
      <input type="file" ref="fileInput" accept=".pdf" class="hidden" @change="handleFileUpload" />
    </div>

    <div 
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      :class="[
        'relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer overflow-hidden group',
        isDragging 
          ? 'border-amber-400 bg-amber-500/10 scale-[1.01]' 
          : 'border-amber-500/30 bg-slate-900/40 hover:border-amber-500/60 hover:bg-slate-900/60'
      ]"
      @click="triggerFileInput"
    >
      <div class="flex flex-col items-center justify-center gap-3 relative z-10">
        <div class="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-all duration-300 shadow-xl shadow-amber-500/10">
          <svg class="w-8 h-8 filter drop-shadow-[0_0_8px_rgba(229,169,60,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <span class="text-sm font-bold text-slate-200">کشیدن و رها کردن فایل PDF در این باکس</span>
          <span class="text-xs text-amber-400 font-semibold block mt-1">یا جهت مرور فایل‌ها کلیک کنید</span>
        </div>
        <span class="text-[11px] text-slate-400">پشتیبانی از فرمت‌های صورت‌حساب فروش، گزارش موجودی انبار، تحلیل مالی (حداکثر ۵۰ مگابایت)</span>
      </div>
    </div>

    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-300 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-amber-400"></span>
          اسناد PDF موجود در سیستم سرای ایرانی
        </h3>
        <span class="text-xs text-slate-400">انتخاب شده جهت پردازش: <strong class="text-amber-400">{{ selectedPdfId ? getSelectedPdfName : 'هیچ‌کدام' }}</strong></span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="pdf in pdfList" 
          :key="pdf.id"
          @click="selectPdf(pdf.id)"
          :class="[
            'glass-panel p-4 rounded-xl cursor-pointer transition-all duration-300 relative border flex flex-col justify-between group',
            selectedPdfId === pdf.id 
              ? 'border-amber-400 bg-amber-500/15 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/50 scale-[1.02]' 
              : 'border-slate-800 hover:border-amber-500/40 hover:bg-slate-800/60'
          ]"
        >
          <div 
            v-if="selectedPdfId === pdf.id" 
            class="absolute top-3 left-3 w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shadow-md animate-bounce"
          >
            ✓
          </div>

          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 01.293-.707l-5.414-5.414A1 1 0 0013.172 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <h4 class="text-xs font-bold text-slate-100 line-clamp-1 group-hover:text-amber-300 transition-colors">{{ pdf.title }}</h4>
              <p class="text-[11px] text-slate-400 mt-0.5">{{ pdf.category }} • {{ pdf.pages }} صفحه</p>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span>تاریخ: {{ pdf.date }}</span>
            <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{{ pdf.size }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const fileInput = ref(null)
const isDragging = ref(false)
const selectedPdfId = ref(1)

const pdfList = ref([
  { id: 1, title: 'گزارش فروش شعب سال ۱۴۰۴ - سرای ایرانی.pdf', category: 'واحد فروش', pages: 42, size: '4.2 MB', date: '۱۴۰۴/۰۸/۱۰' },
  { id: 2, title: 'تحلیل موجودی انبار لوازم خانگی.pdf', category: 'انبارداری', pages: 18, size: '2.1 MB', date: '۱۴۰۴/۰۸/۱۲' },
  { id: 3, title: 'صورت مالی و سود/زیان فصل پاییز.pdf', category: 'حسابداری', pages: 35, size: '5.8 MB', date: '۱۴۰۴/۰۸/۱۵' }
])

const getSelectedPdfName = computed(() => {
  const selected = pdfList.value.find(p => p.id === selectedPdfId.value)
  return selected ? selected.title : ''
})

const triggerFileInput = () => { fileInput.value.click() }
const selectPdf = (id) => { selectedPdfId.value = id }

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file && file.type === 'application/pdf') {
    pdfList.value.unshift({
      id: Date.now(),
      title: file.name,
      category: 'آپلود شده توسط مدیر',
      pages: 12,
      size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
      date: 'هم‌اکنون'
    })
    selectedPdfId.value = pdfList.value[0].id
  }
}

const handleDrop = (event) => {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file && file.type === 'application/pdf') {
    pdfList.value.unshift({
      id: Date.now(),
      title: file.name,
      category: 'آپلود شده توسط مدیر',
      pages: 10,
      size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
      date: 'هم‌اکنون'
    })
    selectedPdfId.value = pdfList.value[0].id
  }
}
</script>
