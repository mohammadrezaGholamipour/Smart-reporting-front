import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { dashboardApi } from '../api/reports'
import { errorMessage } from '@/api/http'

export const useReportStore = defineStore('report', () => {
  const report = ref(null)
  const loading = ref(false)
  const generating = ref(false)
  const missing = ref(false) // هنوز گزارشی ساخته نشده
  const error = ref('')

  async function fetchLatest() {
    loading.value = true
    error.value = ''
    try {
      report.value = await dashboardApi.latest()
      missing.value = false
    } catch (e) {
      if (e.response?.status === 404) {
        missing.value = true
        report.value = null
      } else {
        error.value = errorMessage(e)
      }
    } finally {
      loading.value = false
    }
  }

  async function generate(sourceId) {
    generating.value = true
    try {
      report.value = await dashboardApi.generate(sourceId)
      missing.value = false
      error.value = ''
      toast.success('گزارش مدیریتی ساخته شد.')
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      generating.value = false
    }
  }

  return { report, loading, generating, missing, error, fetchLatest, generate }
})
