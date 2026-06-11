<template>
  <div class="mt-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        视频历史记录
        <span class="text-sm font-normal text-gray-400 dark:text-gray-500 ml-2">({{ videos.length }})</span>
      </h3>
      <div class="flex items-center space-x-2">
        <button
          v-if="videos.length > 0"
          @click="showModal = true"
          class="text-sm text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
        >
          查看全部
        </button>
        <button
          v-if="videos.length > 0"
          @click="clearAll"
          class="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
        >
          清空全部
        </button>
      </div>
    </div>

    <div v-if="videos.length === 0" class="text-center py-8 text-gray-400 dark:text-gray-500">
      <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      <p>暂无视频记录</p>
    </div>

    <!-- Display first N items -->
    <div v-else class="space-y-4">
      <div v-for="(video, idx) in displayedVideos" :key="idx" class="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-sm">
        <video
          v-if="video.status === 'completed' && video.url"
          :src="video.url"
          controls
          class="w-full h-auto max-h-64 bg-black"
        ></video>
        <div v-else class="flex items-center justify-center h-40 bg-gray-200 dark:bg-gray-600">
          <div class="text-center">
            <svg class="w-8 h-8 mx-auto mb-2 text-gray-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <p class="text-sm text-gray-500 dark:text-gray-400">视频生成中...</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">进度: {{ video.progress || 0 }}%</p>
          </div>
        </div>
        <div class="p-3 flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-700 dark:text-gray-300 truncate" :title="video.prompt">{{ video.prompt }}</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ formatDate(video.createdAt) }}</p>
          </div>
          <div class="flex items-center space-x-2 ml-3">
            <a
              v-if="video.status === 'completed' && video.url"
              :href="video.url"target="_blank" rel="noopener noreferrer"
              class="p-1.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 rounded-lg text-gray-700 dark:text-gray-200 transition-colors"
              title="在新页签打开">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </a>
            <button @click="deleteVideo(idx)" class="p-1.5 bg-red-300 dark:bg-red-800 hover:bg-red-400 dark:hover:bg-red-700 rounded-lg text-red-700 dark:text-red-300 transition-colors" title="删除">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- View more button -->
      <div v-if="videos.length > 0" class="text-center">
        <button
          @click="showModal = true"
          class="w-full py-2.5 text-sm text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors border border-dashed border-gray-300 dark:border-gray-600"
        >
          查看更多 (共 {{ videos.length }} 条)
        </button>
      </div>
    </div>

    <!-- All history modal -->
    <Modal :visible="showModal" title="视频历史记录" @close="showModal = false">
      <div v-if="videos.length === 0" class="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
        <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <p class="text-sm">暂无视频记录</p>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="(video, idx) in videos"
          :key="'modal-' + idx"
          class="rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
        >
          <video
            v-if="video.status === 'completed' && video.url"
            :src="video.url"
            controls
            class="w-full aspect-video bg-black object-cover"
          ></video>
          <div v-else class="flex items-center justify-center aspect-video bg-gray-200 dark:bg-gray-700">
            <div class="text-center">
              <svg class="w-8 h-8 mx-auto mb-2 text-gray-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <p class="text-xs text-gray-500 dark:text-gray-400">生成中 {{ video.progress || 0 }}%</p>
            </div>
          </div>
          <div class="p-3 flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <p class="text-xs text-gray-700 dark:text-gray-300 truncate" :title="video.prompt">{{ video.prompt }}</p>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ formatDate(video.createdAt) }}</p>
            </div>
            <div class="flex items-center space-x-1.5 ml-2">
              <a
                v-if="video.status === 'completed' && video.url"
                :href="video.url"
                target="_blank" rel="noopener noreferrer"
                class="p-1.5 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg text-gray-700 dark:text-gray-200 transition-colors"
                title="在新页签打开"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </a>
              <button @click="deleteVideo(idx)" class="p-1.5 bg-red-200 dark:bg-red-800 hover:bg-red-300 dark:hover:bg-red-700 rounded-lg text-red-700 dark:text-red-300 transition-colors" title="删除">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Modal from './Modal.vue'

const STORAGE_KEY = 'agnes-videos'

const videos = ref([])
const showModal = ref(false)

const displayedVideos = computed(() => {
  return videos.value.slice(0, 3)
})

onMounted(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      videos.value = JSON.parse(saved)
    }
  } catch (e) {}
})

watch(videos, (val) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

function addVideo(entry) {
  videos.value.unshift(entry)
}

function updateVideo(taskId, updates) {
  const idx = videos.value.findIndex(v => v.taskId === taskId)
  if (idx !== -1) {
    videos.value[idx] = { ...videos.value[idx], ...updates }
  }
}

function deleteVideo(idx) {
  videos.value.splice(idx, 1)
}

function clearAll() {
  if (confirm('确定要清空所有视频记录吗？')) {
    videos.value = []
    showModal.value = false
  }
}

function formatDate(ts) {
  return new Date(ts).toLocaleString('zh-CN', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

function getPendingCount() {
  return videos.value.filter(v => v.status === 'pending' || v.status === 'processing').length
}

defineExpose({ addVideo, updateVideo, getPendingCount })
</script>
