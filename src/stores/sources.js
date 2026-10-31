
import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { toast } from 'vue-sonner'
import { sourcesApi } from '@/api/sources.api'
import { errorMessage } from '@/api/http'
import { PIPELINE_STEPS } from '@/utils/constants'

/**
 * تبدیل پاسخ API به آرایه اسناد.
 * ساختارهای رایج پاسخ را پشتیبانی می‌کند.
 */
function normalizeSourcesResponse(response) {
  // اگر Axios response کامل برگردانده باشد
  const data = response?.data ?? response

  // حالت مستقیم: [...]
  if (Array.isArray(data)) {
    return data
  }

  // حالت آبجکتی: { items: [...] }
  if (Array.isArray(data?.items)) {
    return data.items
  }

  // حالت آبجکتی: { sources: [...] }
  if (Array.isArray(data?.sources)) {
    return data.sources
  }

  // حالت آبجکتی: { results: [...] }
  if (Array.isArray(data?.results)) {
    return data.results
  }

  throw new TypeError(
    'ساختار پاسخ API برای فهرست اسناد معتبر نیست.'
  )
}

export const useSourcesStore = defineStore('sources', () => {
  const items = ref([])
  const loading = ref(false)
  const loaded = ref(false)
  const uploadProgress = ref(null)

  /**
   * بک‌اند فقط status را نگه می‌دارد؛
   * وضعیت chunk و PageIndex را در مرورگر ذخیره می‌کنیم.
   */
  const done = useStorage('sr-pipeline-done', {})
  const busy = reactive({})
  const stepError = reactive({})

  // فقط اسنادی که embedding آن‌ها تکمیل شده است
  const readyItems = computed(() =>
    items.value.filter((source) => source.status === 'embedded')
  )

  const readyCount = computed(() => readyItems.value.length)

  function isStepDone(source, key) {
    if (!source) return false

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
    done.value = {
      ...done.value,
      [id]: {
        ...(done.value[id] || {}),
        [key]: true,
      },
    }
  }

  function patchItem(updated) {
    if (!updated || updated.id == null) return

    const index = items.value.findIndex(
      (source) => source.id === updated.id
    )

    if (index >= 0) {
      items.value[index] = {
        ...items.value[index],
        ...updated,
      }
    }
  }

  async function fetchAll({ silent = false } = {}) {
    if (!silent) loading.value = true

    try {
      const response = await sourcesApi.list()
      const normalizedItems = normalizeSourcesResponse(response)

      // فقط پس از اعتبارسنجی پاسخ، اطلاعات قبلی جایگزین می‌شوند.
      items.value = normalizedItems
      loaded.value = true

      return normalizedItems
    } catch (error) {
      console.error('[Sources Store] fetchAll failed:', error)

      toast.error(errorMessage(error))

      return null
    } finally {
      loading.value = false
    }
  }

  async function upload(file) {
    uploadProgress.value = 0

    try {
      const response = await sourcesApi.upload(
        file,
        (progress) => {
          uploadProgress.value = progress
        }
      )

      const created = response?.data ?? response

      if (!created || created.id == null) {
        throw new Error('پاسخ بارگذاری سند معتبر نیست.')
      }

      // جلوگیری از ثبت تکراری سند
      const exists = items.value.some(
        (source) => source.id === created.id
      )

      if (!exists) {
        items.value.unshift(created)
      }

      toast.success(`«${created.name || 'سند'}» بارگذاری شد.`)

      return created
    } catch (error) {
      console.error('[Sources Store] upload failed:', error)

      toast.error(errorMessage(error))

      return null
    } finally {
      uploadProgress.value = null
    }
  }

  async function remove(id) {
    try {
      await sourcesApi.remove(id)

      items.value = items.value.filter(
        (source) => source.id !== id
      )

      const { [id]: _drop, ...rest } = done.value
      done.value = rest

      delete busy[id]
      delete stepError[id]

      toast.success('سند حذف شد.')

      return true
    } catch (error) {
      console.error('[Sources Store] remove failed:', error)

      toast.error(errorMessage(error))

      return false
    }
  }

  /**
   * اجرای یک مرحله از Pipeline
   */
  async function runStep(id, key) {
    if (busy[id]) return false

    if (typeof sourcesApi[key] !== 'function') {
      console.error(`[Sources Store] Unknown API step: ${key}`)
      return false
    }

    busy[id] = key
    delete stepError[id]

    try {
      const result = await sourcesApi[key](id)
      const data = result?.data ?? result

      if (key === 'process') {
        patchItem(data)
      }

      if (key === 'chunk' || key === 'pageindex') {
        markDone(id, key)
      }

      if (key === 'embed') {
        markDone(id, 'chunk')

        patchItem({
          id,
          status: data?.status || 'embedded',
        })
      }

      return true
    } catch (error) {
      console.error(
        `[Sources Store] Pipeline step "${key}" failed:`,
        error
      )

      stepError[id] = {
        step: key,
        message: errorMessage(error),
      }

      await fetchAll({ silent: true })

      return false
    } finally {
      busy[id] = null
    }
  }

  /**
   * اجرای پشت‌سرهم مراحل ضروری Pipeline
   */
  async function runAll(id, { withPageindex = false } = {}) {
    const source = items.value.find(
      (item) => item.id === id
    )

    if (!source) return false

    const steps = PIPELINE_STEPS.filter(
      (step) => !step.optional || withPageindex
    )

    for (const step of steps) {
      const current = items.value.find(
        (item) => item.id === id
      )

      if (!current) return false

      if (
        isStepDone(current, step.key) &&
        step.key !== 'pageindex'
      ) {
        continue
      }

      const success = await runStep(id, step.key)

      if (!success) {
        toast.error(`مرحلهٔ «${step.label}» ناموفق بود.`)
        return false
      }
    }

    toast.success('سند آمادهٔ پرسش و پاسخ است.')

    return true
  }

  return {
    items,
    loading,
    loaded,
    uploadProgress,
    busy,
    stepError,

    readyCount,
    readyItems,

    isStepDone,
    fetchAll,
    upload,
    remove,
    runStep,
    runAll,
  }
})
