<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
      <svg class="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      AI 视频生成
    </h3>

    <!-- Input area -->
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">视频描述 (Prompt)</label>
        <textarea
          v-model="prompt"
          placeholder="描述你想要生成的视频内容..."
          :disabled="loading || !isConfigured"
          rows="3"
          class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none"
        ></textarea>
      </div>
      <div class="flex space-x-4">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">宽度</label>
          <select
            v-model="width"
            :disabled="loading"
            class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
          >
            <option value="720">720</option>
            <option value="1080">1080</option>
            <option value="1920">1920</option>
          </select>
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">高度</label>
          <select
            v-model="height"
            :disabled="loading"
            class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
          >
            <option value="720">720</option>
            <option value="1080">1080</option>
            <option value="1920">1920</option>
          </select>
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">总帧数</label>
          <select
            v-model="numFrames"
            :disabled="loading"
            class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
          >
            <option :value="81">81</option>
            <option :value="121">121</option>
            <option :value="161">161</option>
            <option :value="201">201</option>
            <option :value="241">241</option>
            <option :value="281">281</option>
            <option :value="321">321</option>
            <option :value="361">361</option>
            <option :value="401">401</option>
            <option :value="441">441</option>
          </select>
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">帧率 (FPS)</label>
          <select
            v-model="frameRate"
            :disabled="loading"
            class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
          >
            <option :value="16">16</option>
            <option :value="20">20</option>
            <option :value="24">24</option>
            <option :value="30">30</option>
            <option :value="60">60</option>
          </select>
        </div>
      </div>
      <!-- Generate button (when not loading) -->
      <button
        v-if="!loading"
        @click="generateVideo"
        :disabled="!prompt.trim() || !isConfigured"
        class="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      >
        <span>生成视频</span>
      </button>
      <!-- Loading state: spinner + stop button together -->
      <div v-if="loading" class="flex items-center justify-between px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
        <div class="flex items-center space-x-3">
          <LoadingSpinner />
          <span class="text-sm text-indigo-600 dark:text-indigo-400">正在生成视频...</span>
        </div>
        <button
          @click="stopGeneration"
          class="flex items-center space-x-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>停止 ({{ progress }}%)</span>
        </button>
      </div>
      <p v-if="!isConfigured" class="text-xs text-amber-500 dark:text-amber-400">
        请先在 API 配置中设置 API Key
      </p>
    </div>

    <!-- Current video result -->
    <div v-if="currentVideoUrl" class="mt-6">
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">生成的视频:</h4>
      <div class="relative rounded-lg overflow-hidden bg-black">
        <video :src="currentVideoUrl" controls class="w-full h-auto max-h-96"></video>
        <div class="absolute bottom-2 right-2">
          <a
            :href="currentVideoUrl"
            download="agnes-generated-video.mp4"
            class="p-2 bg-white/90 hover:bg-white rounded-lg text-gray-700 transition-colors shadow-sm inline-block"
            title="下载"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
        </div>
      </div>
    </div>

    <!-- Current progress -->
    <div v-if="loading && currentTaskId" class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <p class="text-sm text-blue-600 dark:text-blue-400">视频正在生成中，请耐心等待...</p>
      </div>
      <div class="mt-2 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
        <div class="bg-blue-500 h-2 rounded-full transition-all duration-500" :style="{ width: progress + '%' }"></div>
      </div>
      <p class="text-xs text-blue-500 dark:text-blue-300 mt-1">任务 ID: {{ currentTaskId }}</p>
    </div>

    <!-- Error message -->
    <div v-if="error" class="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
    </div>

    <!-- History -->
    <VideoHistory ref="videoHistoryRef" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useApiConfig } from '../composables/useApiConfig'
import VideoHistory from './VideoHistory.vue'
import LoadingSpinner from './LoadingSpinner.vue'

const { isConfigured, formatUrl, getHeaders, baseUrl } = useApiConfig()

const prompt = ref('')
const width = ref(1080)
const height = ref(720)
const numFrames = ref(441)
const frameRate = ref(24)
const loading = ref(false)
const cancelled = ref(false)
const progress = ref(0)
const currentVideoUrl = ref('')
const currentTaskId = ref('')
const error = ref('')
const videoHistoryRef = ref(null)

async function generateVideo() {
  if (!prompt.value.trim() || loading.value || !isConfigured.value) return

  // Check queue limit: max 3 pending videos allowed
  if (videoHistoryRef.value) {
    const pendingVideos = videoHistoryRef.value.getPendingCount()
    if (pendingVideos >= 3) {
      error.value = `已有 ${pendingVideos} 个视频在生成队列中，请等待完成后重试`
      return
    }
  }

  cancelled.value = false
  loading.value = true
  currentVideoUrl.value = ''
  currentTaskId.value = ''
  error.value = ''
  progress.value = 0

  try {
    // Step 1: Create video task
    const response = await fetch(formatUrl('/v1/videos'), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        model: 'agnes-video-v2.0',
        prompt: prompt.value.trim(),
        width: width.value,
        height: height.value,
        num_frames: numFrames.value,
        frame_rate: frameRate.value,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`API Error: ${response.status} - ${err}`)
    }

    const data = await response.json()
    console.log('Video creation response:', data)

    // Use video_id as primary identifier (more stable for status polling)
    const videoId = data.video_id || data.id || data.task_id
    if (!videoId) {
      throw new Error('API 返回中未找到视频 ID')
    }

    currentTaskId.value = videoId

    // Save to history immediately with pending status
    videoHistoryRef.value?.addVideo({
      taskId: videoId,
      prompt: prompt.value.trim(),
      status: 'pending',
      progress: 0,
      url: '',
      createdAt: Date.now(),
    })

    // Step 2: Start polling for status using video_id only
    startPolling(videoId)
  } catch (err) {
    error.value = err.message
    loading.value = false
  }
}

function stopGeneration() {
  cancelled.value = true
}

async function startPolling(videoId) {
  const pollInterval = 5000 // poll every 5 seconds
  const maxAttempts = 72 // max 6 minutes

  for (let i = 0; i < maxAttempts; i++) {
    // Check if user cancelled
    if (cancelled.value) {
      videoHistoryRef.value?.updateVideo(videoId, { status: 'cancelled' })
      loading.value = false
      return
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval))

    // Check again after sleep
    if (cancelled.value) {
      videoHistoryRef.value?.updateVideo(videoId, { status: 'cancelled' })
      loading.value = false
      return
    }

    try {
      // Poll status using video_id via the /agnesapi endpoint (more reliable)
      const statusUrl = `${baseUrl.value.replace(/\/+$/, '')}/agnesapi?video_id=${videoId}`
      const statusResponse = await fetch(statusUrl, {
        method: 'GET',
        headers: getHeaders(),
      })

      if (!statusResponse.ok) {
        throw new Error(`状态查询失败: ${statusResponse.status}`)
      }

      const statusData = await statusResponse.json()
      console.log('Polling response:', statusData)

      const status = statusData.status?.toLowerCase() || ''
      const pct = statusData.progress || 0
      progress.value = pct

      // Update history
      videoHistoryRef.value?.updateVideo(videoId, { progress: pct })

      if (status === 'completed' || status === 'success' || status === 'succeeded') {
        // Video is ready - extract URL
        const videoUrl = statusData.video_url || statusData.url || statusData.result?.url || statusData.data?.url || statusData.remixed_from_video_id || statusData.output?.url || statusData.video?.url

        if (videoUrl) {
          currentVideoUrl.value = videoUrl
          videoHistoryRef.value?.updateVideo(videoId, {
            status: 'completed',
            url: videoUrl,
            progress: 100,
          })
          loading.value = false
          return
        } else {
          // Completed but no URL yet — wait for next poll
          continue
        }
      } else if (status === 'failed' || status === 'error') {
        const errMsg = statusData.error || statusData.message || '视频生成失败'
        throw new Error(errMsg)
      }
      // status is 'pending' or 'processing' - continue polling
    } catch (err) {
      if (cancelled.value) return
      error.value = err.message
      videoHistoryRef.value?.updateVideo(videoId, {
        status: 'failed',
        error: err.message,
      })
      loading.value = false
      return
    }
  }

  // Max attempts reached
  error.value = '视频生成超时，请稍后刷新页面检查状态'
  videoHistoryRef.value?.updateVideo(videoId, {
    status: 'timeout',
  })
  loading.value = false
}
</script>
