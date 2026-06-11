import { ref } from 'vue'

// In development mode, use Vite proxy to avoid Cloudflare browser-specific connection issues.
// Ignore saved localStorage baseUrl in dev mode so the proxy always takes effect.
const defaultBaseUrl = import.meta.env.DEV
  ? '/api/agnes'
  : (localStorage.getItem('agnes-base-url') || 'https://apihub.agnes-ai.com')
const baseUrl = ref(defaultBaseUrl)
const apiKey = ref(localStorage.getItem('agnes-api-key') || '')

export function useApiConfig() {
  function saveConfig(url, key) {
    baseUrl.value = url
    apiKey.value = key
    isConfigured.value = !!key
    localStorage.setItem('agnes-base-url', url)
    localStorage.setItem('agnes-api-key', key)
  }

  function getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.value}`,
    }
  }

  function formatUrl(path) {
    const base = baseUrl.value.replace(/\/+$/, '')
    return `${base}${path}`
  }

  const isConfigured = ref(!!apiKey.value)

  return {
    baseUrl,
    apiKey,
    isConfigured,
    saveConfig,
    getHeaders,
    formatUrl,
  }
}
