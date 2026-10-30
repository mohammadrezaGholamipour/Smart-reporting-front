import { http } from './http'

export const healthApi = {
  check: () => http.get('/health', { timeout: 5000 }).then((r) => r.data),
}
