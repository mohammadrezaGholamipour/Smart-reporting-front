import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'

const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: { title: 'داشبورد مدیریتی', subtitle: 'شاخص‌ها، نمودارها و تحلیل هر سند PDF' },
      },
      {
        path: 'sources',
        name: 'sources',
        component: () => import('@/views/SourcesView.vue'),
        meta: { title: 'اسناد', subtitle: 'بارگذاری و آماده‌سازی فایل‌های PDF' },
      },
      {
        path: 'chat',
        name: 'chat',
        component: () => import('@/views/ChatView.vue'),
        meta: { title: 'پرسش از اسناد', subtitle: 'گفتگو با هوش مصنوعی بر پایهٔ محتوای PDF' },
      },
      {
        path: 'search',
        name: 'search',
        component: () => import('@/views/SearchView.vue'),
        meta: { title: 'جست‌وجوی معنایی', subtitle: 'یافتن مرتبط‌ترین بخش‌ها در اسناد' },
      },
      {
        path: ':pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@/views/NotFoundView.vue'),
        meta: { title: 'صفحه پیدا نشد' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} | گزارش‌یار` : 'گزارش‌یار'
})

export default router
