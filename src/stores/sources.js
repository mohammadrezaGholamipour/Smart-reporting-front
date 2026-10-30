import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { toast } from 'vue-sonner'
import { sourcesApi } from '@/api/sources.api'
import { errorMessage } from '@/api/http'
import { PIPELINE_STEPS } from '@/utils/constants'

export const useSourcesStore = defineStore('sources', () => {
  const items = ref([])
  const loading = ref(false)
  const loaded = ref(false)
  const uploadProgress = ref(null) // null یا عدد ۰ تا ۱۰۰

  /**
   * بک‌اند فقط status را نگه می‌دارد؛ «قطعه‌بندی» و «PageIndex» در دیتابیس ثبت نمی‌شوند.
   * پس این دو مرحله را در مرورگر به‌خاطر می‌سپاریم تا وضعیت پایپ‌لاین درست نمایش داده شود.
   */
  const done = useStorage('sr-pipeline-done', {})
  const busy = reactive({}) // { [id]: 'embed' | null }
  const stepError = reactive({}) // { [id]: { step, message } }

  const readyCount = computed(() => items.value.filter((s) => s.status === 'embedded').length)
  const readyItems = computed(() => items.value.filter((s) => s.status === 'embedded'))

  function isStepDone(source, key) {
    const local = done.value[source.id] || {}
    switch (key) {
      case 'process':
        return ['processed', 'embedded'].includes(source.status)
      case 'chunk':
        return source.status === 'embedded' || !!local.chunk
      case 'embed':
        return source.status === 'embedded'
      case 'pageindex':
        return !!local.pageindex
      default:
        return false
    }
  }

  function markDone(id, key) {
    done.value = { ...done.value, [id]: { ...(done.value[id] || {}), [key]: true } }
  }

  function patchItem(updated) {
    const i = items.value.findIndex((s) => s.id === updated.id)
    if (i >= 0) items.value[i] = { ...items.value[i], ...updated }
  }

  async function fetchAll({ silent = false } = {}) {
    if (!silent) loading.value = true
    try {
      items.value = await sourcesApi.list()
      loaded.value = true
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      loading.value = false
    }
  }

  async function upload(file) {
    uploadProgress.value = 0
    try {
      const created = await sourcesApi.upload(file, (p) => (uploadProgress.value = p))
      items.value.unshift(created)
      toast.success(`«${created.name}» بارگذاری شد.`)
      return created
    } catch (e) {
      toast.error(errorMessage(e))
      return null
    } finally {
      uploadProgress.value = null
    }
  }

  async function remove(id) {
    try {
      await sourcesApi.remove(id)
      items.value = items.value.filter((s) => s.id !== id)
      const { [id]: _drop, ...rest } = done.value
      done.value = rest
      toast.success('سند حذف شد.')
      return true
    } catch (e) {
      toast.error(errorMessage(e))
      return false
    }
  }

  /** اجرای یک مرحله. در صورت خطا پیام را نگه می‌داریم تا کارت سند بتواند نشانش دهد. */
  async function runStep(id, key) {
    if (busy[id]) return false
    busy[id] = key
    delete stepError[id]

    try {
      const result = await sourcesApi[key](id)
      if (key === 'process') patchItem(result)
      if (key === 'chunk' || key === 'pageindex') markDone(id, key)
      if (key === 'embed') {
        markDone(id, 'chunk')
        patchItem({ id, status: result.status })
      }
      return true
    } catch (e) {
      stepError[id] = { step: key, message: errorMessage(e) }
      await fetchAll({ silent: true })
      return false
    } finally {
      busy[id] = null
    }
  }

  /** اجرای پشت‌سرهم مراحل ضروری (و در صورت درخواست، PageIndex) */
  async function runAll(id, { withPageindex = false } = {}) {
    const source = items.value.find((s) => s.id === id)
    if (!source) return false

    const steps = PIPELINE_STEPS.filter((s) => !s.optional || withPageindex)
    for (const step of steps) {
      const current = items.value.find((s) => s.id === id)
      if (isStepDone(current, step.key) && step.key !== 'pageindex') continue
      const ok = await runStep(id, step.key)
      if (!ok) {
        toast.error(`مرحلهٔ «${step.label}» ناموفق بود.`)
        return false
      }
    }
    toast.success('سند آمادهٔ پرسش و پاسخ است.')
    return true
  }

  return {
    items, loading, loaded, uploadProgress, busy, stepError,
    readyCount, readyItems,
    isStepDone, fetchAll, upload, remove, runStep, runAll,
  }
})
