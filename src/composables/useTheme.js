import { ref, watch } from 'vue'

const isDark = ref(false)

// Initialize from localStorage
const stored = localStorage.getItem('agnes-theme')
if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  isDark.value = true
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}

export function useTheme() {
  function toggleTheme() {
    isDark.value = !isDark.value
  }

  watch(isDark, (val) => {
    if (val) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('agnes-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('agnes-theme', 'light')
    }
  })

  return {
    isDark,
    toggleTheme,
  }
}
