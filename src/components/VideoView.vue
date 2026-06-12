<template>
  <div class="flex space-x-4">
    <!-- Left: Generation panel -->
    <div class="flex-1 min-w-0 space-y-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg class="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          AI 视频生成
        </h3>

        <div class="space-y-4">
          <!-- Mode selector -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">模式</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                @click="videoMode = 'ti2vid'"
                :class="[
                  'py-2 px-3 rounded-lg text-sm font-medium transition-all',
                  videoMode === 'ti2vid'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                ]"
              >文生视频</button>
              <button
                @click="videoMode = 'img2vid'"
                :class="[
                  'py-2 px-3 rounded-lg text-sm font-medium transition-all',
                  videoMode === 'img2vid'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                ]"
              >图生视频</button>
              <button
                @click="videoMode = 'multi-img'"
                :class="[
                  'py-2 px-3 rounded-lg text-sm font-medium transition-all',
                  videoMode === 'multi-img'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                ]"
              >多图视频</button>
              <button
                @click="videoMode = 'keyframes'"
                :class="[
                  'py-2 px-3 rounded-lg text-sm font-medium transition-all',
                  videoMode === 'keyframes'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                ]"
              >关键帧动画</button>
            </div>
          </div>

          <!-- Mode-specific inputs -->
          <!-- 图生视频: single image URL -->
          <div v-if="videoMode === 'img2vid'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">源图片 URL</label>
            <div class="flex space-x-1">
              <input
                v-model="sourceImageInput"
                @keydown.enter="addSourceImage"
                placeholder="粘贴图片 URL..."
                class="flex-1 px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              />
              <button
                @click="addSourceImage"
                :disabled="!sourceImageInput.trim()"
                class="px-3 py-1.5 text-xs bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >确认</button>
            </div>
            <div v-if="sourceImages.length > 0" class="mt-2 flex items-center space-x-2 px-2 py-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <img :src="sourceImages[0]" class="w-10 h-10 rounded object-cover flex-shrink-0" />
              <span class="flex-1 text-xs text-gray-600 dark:text-gray-400 truncate">{{ sourceImages[0] }}</span>
              <button @click="sourceImages = []" class="text-xs text-red-500 hover:text-red-600 flex-shrink-0">清除</button>
            </div>
          </div>

          <!-- 多图视频: multiple image URLs -->
          <div v-if="videoMode === 'multi-img'">
            <label class="block text-xs text-indigo-500 dark:text-indigo-400 mb-1">该模式使用 keyframes 模式，图片将作为关键帧序列</label>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              多张图片 URL
              <span class="text-xs text-gray-400 ml-1">(按顺序排列)</span>
            </label>
            <div class="flex space-x-1">
              <input
                v-model="multiImageInput"
                @keydown.enter="addMultiImage"
                placeholder="粘贴图片 URL..."
                class="flex-1 px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              />
              <button
                @click="addMultiImage"
                :disabled="!multiImageInput.trim()"
                class="px-3 py-1.5 text-xs bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >添加</button>
            </div>
            <div v-if="multiImages.length > 0" class="mt-2 space-y-1">
              <div
                v-for="(url, idx) in multiImages"
                :key="'mi-' + idx"
                class="flex items-center space-x-2 px-2 py-1 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <span class="text-xs text-gray-400 w-4">{{ idx + 1 }}.</span>
                <img :src="url" class="w-8 h-8 rounded object-cover flex-shrink-0" />
                <span class="flex-1 text-xs text-gray-600 dark:text-gray-400 truncate">{{ url }}</span>
                <button @click="multiImages.splice(idx, 1)" class="text-xs text-red-500 hover:text-red-600 flex-shrink-0">删除</button>
              </div>
            </div>
          </div>

          <!-- 关键帧动画: keyframe pairs -->
          <div v-if="videoMode === 'keyframes'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              关键帧
              <span class="text-xs text-gray-400 ml-1">(帧索引 + 图片 URL)</span>
            </label>
            <div class="space-y-2">
              <div
                v-for="(kf, idx) in keyframes"
                :key="'kf-' + idx"
                class="flex items-center space-x-2 px-2 py-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <img :src="kf.image" class="w-8 h-8 rounded object-cover flex-shrink-0" />
                <span class="text-xs text-gray-500 w-20">帧 {{ kf.frame_index }}</span>
                <span class="flex-1 text-xs text-gray-600 dark:text-gray-400 truncate">{{ kf.image }}</span>
                <button @click="keyframes.splice(idx, 1)" class="text-xs text-red-500 hover:text-red-600 flex-shrink-0">删除</button>
              </div>
            </div>
            <div class="mt-2 grid grid-cols-3 gap-2">
              <input
                v-model.number="newKeyframeIndex"
                type="number"
                min="0"
                placeholder="帧索引"
                class="px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              />
              <input
                v-model="newKeyframeImage"
                @keydown.enter="addKeyframe"
                placeholder="图片 URL"
                class="col-span-1 px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              />
              <button
                @click="addKeyframe"
                :disabled="!newKeyframeImage.trim()"
                class="px-2 py-1.5 text-xs bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >添加</button>
            </div>
          </div>

          <!-- Prompt -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">视频描述 (Prompt)</label>
            <textarea
              v-model="prompt"
              :placeholder="promptPlaceholder"
              :disabled="loading || !isConfigured"
              rows="2"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none text-sm"
            ></textarea>
          </div>

          <!-- Parameters grid -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                尺寸
                <ParamTip tip="视频画面的分辨率。<br><b>横屏 16:9</b>：1920×1080（1080p）、1280×720（720p）、1152×768（推荐）<br><b>竖屏 9:16</b>：1080×1920、720×1280<br><b>超宽 21:9</b>：2560×1080<br><b>方形</b>：1024×1024<br>推荐：1152×768（横屏性价比最高）。" title="尺寸说明" />
              </label>
              <select
                v-model="videoSize"
                :disabled="loading"
                class="w-full px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
              >
                <!-- 横屏 16:9 -->
                <option value="1920x1080">1920 × 1080 (16:9 1080p)</option>
                <option value="1280x720">1280 × 720 (16:9 720p)</option>
                <option value="1152x768">1152 × 768 (推荐)</option>
                <option value="960x540">960 × 540 (16:9)</option>
                <option value="640x360">640 × 360 (16:9)</option>
                <!-- 竖屏 9:16 -->
                <option value="1080x1920">1080 × 1920 (9:16 竖屏)</option>
                <option value="720x1280">720 × 1280 (9:16 竖屏)</option>
                <option value="576x1024">576 × 1024 (9:16 竖屏)</option>
                <!-- 超宽 21:9 -->
                <option value="2560x1080">2560 × 1080 (21:9 超宽)</option>
                <option value="1920x810">1920 × 810 (21:9)</option>
                <!-- 方形 -->
                <option value="1024x1024">1024 × 1024 (1:1 方形)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              总帧数
              <ParamTip tip="视频的总帧数，必须满足 8n+1 且 ≤ 441。视频时长 = num_frames ÷ frame_rate。81 (~3s) 最快，适合快速预览；121 (~5s) 默认推荐；161 (~7s)；241 (~10s)；441 (~18s) 最长生成最慢。帧数越多生成时间越长。" title="总帧数说明" />
            </label>
              <select
                v-model.number="numFrames"
                :disabled="loading"
                class="w-full px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
              >
                <option :value="81">81 (~3s)</option>
                <option :value="121">121 (~5s)</option>
                <option :value="161">161 (~7s)</option>
                <option :value="241">241 (~10s)</option>
                <option :value="441">441 (~18s)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              帧率 (FPS)
              <ParamTip tip="每秒播放的帧数，影响视频流畅度和时长。范围 1-60。推荐 24 — 电影感最稳定；30 更流畅；60 极流畅但生成时间翻倍。时长 = num_frames ÷ frame_rate。例如 121 帧 / 24 FPS ≈ 5 秒。" title="帧率说明" />
            </label>
              <select
                v-model.number="frameRate"
                :disabled="loading"
                class="w-full px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
              >
                <option :value="16">16</option>
                <option :value="20">20</option>
                <option :value="24">24</option>
                <option :value="30">30</option>
                <option :value="60">60</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                随机种子
                <ParamTip tip="控制视频生成的随机性。-1 为随机种子（每次生成不同结果），固定数字则相同 prompt + 相同 seed = 相同结果，可用于复现满意的生成效果。" title="随机种子说明" />
              </label>
              <input
                v-model.number="seed"
                type="number"
                placeholder="-1 (随机)"
                :disabled="loading"
                class="w-full px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <!-- Negative prompt -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              负面提示词 (Negative Prompt)
              <ParamTip tip="描述你不希望出现在视频中的内容，例如：blurry, low quality, distorted, watermark, text, logo 等。使用英文效果更佳。留空则不启用。" title="负面提示词说明" />
            </label>
            <input
              v-model="negativePrompt"
              placeholder="不想出现在视频中的内容..."
              :disabled="loading"
              class="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
            />
          </div>

          <!-- Generate button (when not loading) -->
          <button
            v-if="!loading"
            @click="generateVideo"
            :disabled="!canGenerate || !isConfigured"
            class="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 text-sm"
          >
            <span>{{ generateButtonText }}</span>
          </button>
          <!-- Loading state: spinner + stop button together -->
          <div v-if="loading" class="flex items-center justify-between px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
            <div class="flex items-center space-x-3">
              <LoadingSpinner />
              <span class="text-sm text-indigo-600 dark:text-indigo-400">正在{{ modeLabel }}...</span>
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
      </div>

      <!-- Current result -->
      <div v-if="currentVideoUrl" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-between">
          <span>生成结果</span>
          <a
            :href="currentVideoUrl"
            target="_blank" rel="noopener noreferrer"
            class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center space-x-1"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>下载</span>
          </a>
        </h4>
        <div class="relative rounded-lg overflow-hidden bg-black border border-gray-200 dark:border-gray-600">
          <video :src="currentVideoUrl" controls class="w-full h-auto max-h-96"></video>
        </div>
      </div>

      <!-- Current progress -->
      <div v-if="loading && currentTaskId" class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <div class="flex items-center space-x-2">
          <svg class="w-4 h-4 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p class="text-sm text-blue-600 dark:text-blue-400">{{ modeLabel }}生成中{{ progress > 0 ? ` (${progress}%)` : '...' }}</p>
        </div>
        <div class="mt-2 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
          <div class="bg-blue-500 h-2 rounded-full transition-all duration-500" :style="{ width: progress + '%' }"></div>
        </div>
      </div>

      <!-- Error message -->
      <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
        <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
      </div>
    </div>

    <!-- Right: History panel -->
    <div class="w-72 flex-shrink-0">
      <VideoHistory ref="videoHistoryRef" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useApiConfig } from '../composables/useApiConfig'
import VideoHistory from './VideoHistory.vue'
import LoadingSpinner from './LoadingSpinner.vue'
import ParamTip from './ParamTip.vue'

const { isConfigured, formatUrl, getHeaders, baseUrl } = useApiConfig()

// Mode (UI mode: ti2vid/img2vid/multi-img/keyframes)
const videoMode = ref('ti2vid')

// API mode value (ti2vid or keyframes)
const apiMode = computed(() => {
  if (videoMode.value === 'multi-img' || videoMode.value === 'keyframes') return 'keyframes'
  return 'ti2vid'
})

// Image inputs
const sourceImageInput = ref('')
const sourceImages = ref([])

const multiImageInput = ref('')
const multiImages = ref([])

const newKeyframeIndex = ref(0)
const newKeyframeImage = ref('')
const keyframes = ref([])

// Prompt
const prompt = ref('')
const videoSize = ref('1152x768') // 统一尺寸格式，默认推荐
const width = ref(1152)
const height = ref(768)
const seed = ref(-1)
const negativePrompt = ref('')
const numFrames = ref(121)
const frameRate = ref(24)

// 监听 videoSize 变化，自动更新 width 和 height
watch(videoSize, (newSize) => {
  const [w, h] = newSize.split('x').map(Number)
  width.value = w
  height.value = h
})

// State
const loading = ref(false)
const cancelled = ref(false)
const abortController = ref(null)
const progress = ref(0)
const currentVideoUrl = ref('')
const currentTaskId = ref('')
const error = ref('')
const videoHistoryRef = ref(null)

// Computed
const promptPlaceholder = computed(() => {
  switch (videoMode.value) {
    case 'ti2vid': return '描述你想要生成的视频内容...'
    case 'img2vid': return '描述图片中的人物/场景如何运动...'
    case 'multi-img': return '描述图片序列的连贯动画...'
    case 'keyframes': return '描述关键帧之间的动画过渡...'
    default: return '描述你想要生成的视频内容...'
  }
})

const modeLabel = computed(() => {
  switch (videoMode.value) {
    case 'ti2vid': return '视频'
    case 'img2vid': return '图生视频'
    case 'multi-img': return '多图视频'
    case 'keyframes': return '关键帧动画'
    default: return '视频'
  }
})

const generateButtonText = computed(() => {
  switch (videoMode.value) {
    case 'ti2vid': return '生成视频'
    case 'img2vid': return '生成图生视频'
    case 'multi-img': return '生成多图视频'
    case 'keyframes': return '生成关键帧动画'
    default: return '生成视频'
  }
})

const canGenerate = computed(() => {
  if (!prompt.value.trim()) return false
  if (videoMode.value === 'img2vid' && sourceImages.value.length === 0) return false
  if (videoMode.value === 'multi-img' && multiImages.value.length === 0) return false
  if (videoMode.value === 'keyframes' && keyframes.value.length < 2) return false
  return true
})

function addSourceImage() {
  const url = sourceImageInput.value.trim()
  if (url) {
    sourceImages.value = [url]
    sourceImageInput.value = ''
  }
}

function addMultiImage() {
  const url = multiImageInput.value.trim()
  if (url) {
    multiImages.value.push(url)
    multiImageInput.value = ''
  }
}

function addKeyframe() {
  const url = newKeyframeImage.value.trim()
  if (url) {
    keyframes.value.push({
      frame_index: newKeyframeIndex.value,
      image: url,
    })
    newKeyframeIndex.value = keyframes.value.length > 0
      ? keyframes.value[keyframes.value.length - 1].frame_index + 24
      : 0
    newKeyframeImage.value = ''
  }
}

async function generateVideo() {
  if (!canGenerate.value || loading.value || !isConfigured.value) return

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

  // Create AbortController for cancellation
  abortController.value = new AbortController()
  const signal = abortController.value.signal

  // Build request body
  const extraBody = {
    mode: apiMode.value,
  }

  switch (videoMode.value) {
    case 'img2vid':
      // image 参数必须在 extra_body 中
      extraBody.image = sourceImages.value[0]
      break
    case 'multi-img':
      // images 数组必须在 extra_body 中
      extraBody.images = [...multiImages.value]
      break
    case 'keyframes':
      extraBody.keyframes = keyframes.value.map(kf => ({
        frame_index: kf.frame_index,
        image: kf.image,
      }))
      break
  }

  const requestBody = {
    model: 'agnes-video-v2.0',
    prompt: prompt.value.trim(),
    width: width.value,
    height: height.value,
    num_frames: numFrames.value,
    frame_rate: frameRate.value,
    seed: seed.value >= 0 ? seed.value : undefined,
    negative_prompt: negativePrompt.value.trim() || undefined,
    extra_body: {
      ...extraBody,
      response_format: 'url',
    },
  }

  let videoId = ''

  try {
    // Step 1: Create video task
    const response = await fetch(formatUrl('/v1/videos'), {
      method: 'POST',
      headers: getHeaders(),
      signal,
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`API Error: ${response.status} - ${err}`)
    }

    const data = await response.json()
    console.log('Video creation response:', data)

    // Use video_id as primary identifier (more stable for status polling)
    videoId = data.video_id || data.id || data.task_id
    if (!videoId) {
      throw new Error('API 返回中未找到视频 ID')
    }

    currentTaskId.value = videoId

    // Save to history immediately with pending status
    videoHistoryRef.value?.addVideo({
      taskId: videoId,
      prompt: prompt.value.trim(),
      mode: videoMode.value,
      status: 'pending',
      progress: 0,
      url: '',
      createdAt: Date.now(),
    })

    // Step 2: Start polling for status using video_id only
    startPolling(videoId, signal)
  } catch (err) {
    if (err.name === 'AbortError') {
      // User cancelled — clean up
      videoHistoryRef.value?.updateVideo(videoId, { status: 'cancelled' })
    } else {
      error.value = err.message
    }
    loading.value = false
    abortController.value = null
  }
}

function stopGeneration() {
  cancelled.value = true
  // Abort any in-flight fetch immediately
  if (abortController.value) {
    abortController.value.abort()
    abortController.value = null
  }
  // Clean up the pending history entry if still pending
  if (currentTaskId.value) {
    videoHistoryRef.value?.updateVideo(currentTaskId.value, { status: 'cancelled' })
  }
}

async function startPolling(videoId, signal) {
  const pollInterval = 5000
  const requestTimeout = 30000 // 单次请求超时 30 秒
  const maxAttempts = 120 // 最多轮询 120 次 = 10 分钟
  let consecutiveErrors = 0
  let consecutiveEmpty = 0 // 连续空响应计数

  for (let i = 0; i < maxAttempts; i++) {
    if (cancelled.value) {
      videoHistoryRef.value?.updateVideo(videoId, { status: 'cancelled' })
      loading.value = false
      return
    }

    // 等待轮询间隔
    await new Promise(resolve => setTimeout(resolve, pollInterval))

    if (cancelled.value) {
      videoHistoryRef.value?.updateVideo(videoId, { status: 'cancelled' })
      loading.value = false
      return
    }

    try {
      // 使用 AbortController 控制请求超时
      const timeoutController = new AbortController()
      const timeoutId = setTimeout(() => timeoutController.abort(), requestTimeout)

      const statusUrl = `${baseUrl.value.replace(/\/+$/, '')}/agnesapi?video_id=${videoId}`
      const statusResponse = await fetch(statusUrl, {
        method: 'GET',
        headers: getHeaders(),
        signal: AbortSignal.any([signal, timeoutController.signal]),
      })

      clearTimeout(timeoutId)

      // 处理 503 排队：指数退避重试
      if (!statusResponse.ok && statusResponse.status === 503) {
        consecutiveErrors++
        if (consecutiveErrors <= 5) {
          const backoffMs = Math.min(1000 * Math.pow(2, consecutiveErrors), 30000)
          progress.value = 0
          await new Promise(resolve => setTimeout(resolve, backoffMs))
          if (cancelled.value) {
            videoHistoryRef.value?.updateVideo(videoId, { status: 'cancelled' })
            loading.value = false
            return
          }
          i-- // 不消耗轮询次数
          continue
        } else {
          throw new Error(`视频生成服务繁忙（503），已等待多次仍无响应。免费 API 高峰期排队较长，请稍后在历史记录中刷新查看。`)
        }
      }

      // 其他 HTTP 错误：非 503 的错误也做退避重试
      if (!statusResponse.ok) {
        consecutiveErrors++
        if (consecutiveErrors <= 3) {
          const backoffMs = Math.min(1000 * Math.pow(2, consecutiveErrors), 15000)
          await new Promise(resolve => setTimeout(resolve, backoffMs))
          i-- // 不消耗轮询次数
          continue
        }
        throw new Error(`状态查询失败: ${statusResponse.status}`)
      }

      consecutiveErrors = 0 // 重置错误计数
      const statusData = await statusResponse.json()

      // 检查空响应或无效响应
      if (!statusData || Object.keys(statusData).length === 0) {
        consecutiveEmpty++
        if (consecutiveEmpty >= 3) {
          // 连续 3 次空响应，可能是服务问题，提示用户
          error.value = `查询结果为空，请检查网络或稍后重试 (${i + 1}/${maxAttempts})`
        }
        continue
      }
      consecutiveEmpty = 0

      console.log('Polling response:', statusData)

      const status = statusData.status?.toLowerCase() || ''
      const pct = statusData.progress || 0
      progress.value = pct

      videoHistoryRef.value?.updateVideo(videoId, { progress: pct })

      if (status === 'completed' || status === 'success' || status === 'succeeded') {
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
          // 有状态但没有 URL，继续轮询
          continue
        }
      } else if (status === 'failed' || status === 'error') {
        const errMsg = statusData.error || statusData.message || '视频生成失败'
        throw new Error(errMsg)
      }
      // 其他状态（queued, in_progress 等）继续轮询
    } catch (err) {
      if (err.name === 'AbortError') {
        // 请求超时
        consecutiveErrors++
        if (consecutiveErrors <= 3) {
          i-- // 不消耗轮询次数
          continue
        }
        error.value = '网络请求超时，请检查网络连接'
        videoHistoryRef.value?.updateVideo(videoId, {
          status: 'failed',
          error: '网络请求超时',
        })
        loading.value = false
        return
      }
      if (cancelled.value) {
        videoHistoryRef.value?.updateVideo(videoId, { status: 'cancelled' })
        loading.value = false
        return
      }
      error.value = err.message
      videoHistoryRef.value?.updateVideo(videoId, {
        status: 'failed',
        error: err.message,
      })
      loading.value = false
      return
    }
  }

  // 超时后不清除任务，让用户可以在历史记录中刷新查看
  error.value = `视频生成已超时（${maxAttempts * pollInterval / 1000 / 60}分钟），请稍后在历史记录中刷新查看状态`
  videoHistoryRef.value?.updateVideo(videoId, {
    status: 'timeout',
  })
  loading.value = false
}
</script>
