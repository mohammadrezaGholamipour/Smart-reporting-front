import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { StorageSerializers, useStorage } from '@vueuse/core'
import { dashboardApi } from '@/api/reports'
import { errorMessage } from '@/api/http'

export const useDashboardStore = defineStore('dashboard', () => {
  const dashboard = ref(null)
  // آخرین سند انتخاب‌شده؛ با serializer شیء تا شناسهٔ عددی به رشته تبدیل نشود
  const sourceId = useStorage('sr-dashboard-source', null, undefined, { serializer: StorageSerializers.object })
  const loading = ref(false)
  const generating = ref(false)
  const error = ref('')
  const missing = ref(false) // برای این سند هنوز داشبوردی ساخته نشده

  // اگر کاربر سند را عوض کند، پاسخ درخواست قبلی نباید جایگزین نتیجهٔ جدید شود.
  let token = 0

  const components = computed(() => dashboard.value?.components ?? [])
  const hasDashboard = computed(() => Boolean(dashboard.value))

  function clear() {
    dashboard.value = null
    error.value = ''
    missing.value = false
  }

  async function fetchDashboard(id) {
    const mine = ++token
    clear()
    sourceId.value = id
    generating.value = false // نتیجهٔ ساخت قبلی (اگر در جریان بود) دیگر نمایش داده نمی‌شود
    loading.value = true
    try {
      const result = await dashboardApi.get(id)
      if (mine === token) dashboard.value = result
    } catch (e) {
      if (mine !== token) return
      if (e.response?.status === 404) missing.value = true
      else error.value = errorMessage(e)
    } finally {
      if (mine === token) loading.value = false
    }
  }

  async function generate(id, payload = {}) {
    const mine = ++token
    generating.value = true
    loading.value = false
    error.value = ''
    missing.value = false
    sourceId.value = id
    try {
      const result = await dashboardApi.generate(id, payload)
      if (mine === token) dashboard.value = result
      return result
    } catch (e) {
      if (mine === token) error.value = errorMessage(e)
      return null
    } finally {
      if (mine === token) generating.value = false
    }
  }

  return { dashboard, sourceId, loading, generating, error, missing, components, hasDashboard, fetchDashboard, generate, clear }
})
