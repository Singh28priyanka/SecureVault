import axios from 'axios'

/**
 * Axios instance pointed at the backend API. In dev, Vite proxies /api to
 * http://localhost:8080. A response interceptor transparently refreshes the
 * access token once on a 401, then retries the original request.
 */
// In dev, Vite proxies '/api' to localhost:8080. In production (e.g. Vercel),
// set VITE_API_URL to the deployed backend, e.g. https://securevault-api.onrender.com/api
export const API_BASE = import.meta.env.VITE_API_URL || '/api'

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

export const tokenStore = {
  get access() {
    return localStorage.getItem('sv_access')
  },
  get refresh() {
    return localStorage.getItem('sv_refresh')
  },
  set({ accessToken, refreshToken }) {
    if (accessToken) localStorage.setItem('sv_access', accessToken)
    if (refreshToken) localStorage.setItem('sv_refresh', refreshToken)
  },
  clear() {
    localStorage.removeItem('sv_access')
    localStorage.removeItem('sv_refresh')
  },
}

client.interceptors.request.use((config) => {
  const token = tokenStore.access
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshing = null

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const isAuthCall = original?.url?.includes('/auth/')

    if (status === 401 && !original._retried && !isAuthCall && tokenStore.refresh) {
      original._retried = true
      try {
        refreshing =
          refreshing ||
          axios.post(`${API_BASE}/auth/refresh`, { refreshToken: tokenStore.refresh })
        const { data } = await refreshing
        refreshing = null
        tokenStore.set(data)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return client(original)
      } catch (e) {
        refreshing = null
        tokenStore.clear()
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

/** Normalises backend error payloads into a display string. */
export function apiError(err, fallback = 'Something went wrong') {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback
  )
}

export default client
