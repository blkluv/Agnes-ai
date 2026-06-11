import { ref } from 'vue'

// Default to local proxy path (/api/agnes) so requests go through Vite dev server proxy
// or Vercel rewrites instead of calling the API directly from the browser.
// This avoids Cloudflare's browser-specific connection issues (ERR_CONNECTION_CLOSED).
// The user can override via the settings UI (saves to localStorage).
const defaultBaseUrl = localStorage.getItem('agnes-base-url') || '/api/agnes'
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
