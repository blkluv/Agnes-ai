<template>
  <div :class="['flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200', activeTab === 'chat' ? 'overflow-hidden' : 'min-h-screen']" :style="activeTab === 'chat' ? { height: 'var(--app-height)' } : {}">
    <!-- Header -->
    <header class="sticky top-0 z-20 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-5xl mx-auto px-3 sm:px-6">
        <div class="flex items-center justify-between h-14 sm:h-16">
          <!-- Logo -->
          <div class="flex items-center space-x-2 sm:space-x-3">
            <div class="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-xs sm:text-sm">A</span>
            </div>
            <h1 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Agnes AI</h1>
          </div>

          <div class="flex items-center space-x-1 sm:space-x-2">
            <!-- Theme toggle -->
            <button
              @click="toggleTheme"
              class="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              :title="isDark ? '切换到亮色模式' : '切换到暗色模式'"
            >
              <!-- Sun icon -->
              <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <!-- Moon icon -->
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>

            <!-- Config button -->
            <button
              @click="showConfig = !showConfig"
              class="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="API 配置"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Tab navigation -->
        <nav class="flex space-x-1 -mb-px overflow-x-auto scrollbar-hide">
          <button
            v-for="tab in tabs" :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap flex-shrink-0',
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            ]"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            <span>{{ tab.label }}</span>
          </button>
        </nav>
      </div>
    </header>

    <!-- Main content -->
    <main :class="['flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6', activeTab === 'chat' ? 'overflow-hidden flex flex-col min-h-0' : '']">
      <!-- API Config panel -->
      <Transition name="slide">
        <ApiConfig v-if="showConfig" @saved="handleConfigSaved" />
      </Transition>

      <!-- Save success toast -->
      <Transition name="fade">
        <div v-if="showSaveSuccess" class="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center space-x-2">
          <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <p class="text-sm text-green-600 dark:text-green-400">配置已保存成功！</p>
        </div>
      </Transition>

      <!-- Connection status -->
      <div v-if="!isConfigured && !showConfig" class="mb-4 sm:mb-6 p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p class="text-xs sm:text-sm text-amber-600 dark:text-amber-400">请先配置 API Key</p>
          </div>
          <button
            @click="showConfig = true"
            class="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
          >
            去配置
          </button>
        </div>
      </div>

      <!-- Tab content -->
      <Transition name="fade" mode="out-in">
        <ChatView v-if="activeTab === 'chat'" :key="'chat'" />
        <ImageView v-else-if="activeTab === 'image'" :key="'image'" />
        <VideoView v-else-if="activeTab === 'video'" :key="'video'" />
      </Transition>
    </main>
  </div>
</template>

<script setup>
import { ref, markRaw, h } from 'vue'
import { useTheme } from './composables/useTheme'
import { useApiConfig } from './composables/useApiConfig'
import ApiConfig from './components/ApiConfig.vue'
import ChatView from './components/ChatView.vue'
import ImageView from './components/ImageView.vue'
import VideoView from './components/VideoView.vue'

const { isDark, toggleTheme } = useTheme()
const { isConfigured } = useApiConfig()

const activeTab = ref('chat')
const showConfig = ref(false)
const showSaveSuccess = ref(false)

function handleConfigSaved() {
  showConfig.value = false
  showSaveSuccess.value = true
  setTimeout(() => {
    showSaveSuccess.value = false
  }, 3000)
}

// Tab definitions with inline SVG icons
function ChatIcon() {
  return h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': 2, d: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' }),
  ])
}
function ImageIcon() {
  return h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': 2, d: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' }),
  ])
}
function VideoIcon() {
  return h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': 2, d: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' }),
  ])
}

const tabs = [
  { id: 'chat', label: '对话', icon: markRaw(ChatIcon) },
  { id: 'image', label: '图片', icon: markRaw(ImageIcon) },
  { id: 'video', label: '视频', icon: markRaw(VideoIcon) },
]
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}
.slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
