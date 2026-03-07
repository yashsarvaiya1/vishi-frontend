// lib/axios.ts

import axios from 'axios'
import { env } from 'next-runtime-env'

const getBasicAuth = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('auth-storage')
    if (!raw) return null
    const { state } = JSON.parse(raw)
    const { mobile_number, password } = state || {}
    if (!mobile_number || !password) return null
    return 'Basic ' + btoa(`${mobile_number}:${password}`)
  } catch {
    return null
  }
}

const api = axios.create({
  baseURL: env('NEXT_PUBLIC_API_URL') ?? 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const auth = getBasicAuth()
  if (auth) config.headers['Authorization'] = auth
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
