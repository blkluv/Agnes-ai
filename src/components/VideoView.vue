<template>
  <div class="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
    <!-- Left: Generation panel -->
    <div class="flex-1 space-y-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg class="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span class="flex-1">AI Video Generation</span>
          <button
            @click="showHistory = !showHistory"
            class="md:hidden p-1.5 rounded-lg text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
            title="History"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </h3>

        <div class="space-y-4">
          <!-- Mode selector -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mode</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                @click="videoMode = 'ti2vid'"
                :class="[
                  'py-2 px-3 rounded-lg text-sm font-medium transition-all',
                  videoMode === 'ti2vid'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                ]"
              >Text to Video</button>
              <button
                @click="videoMode = 'img2vid'"
                :class="[
                  'py-2 px-3 rounded-lg text-sm font-medium transition-all',
                  videoMode === 'img2vid'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                ]"
              >Image to Video</button>
              <button
                @click="videoMode = 'multi-img'"
                :class="[
                  'py-2 px-3 rounded-lg text-sm font-medium transition-all',
                  videoMode === 'multi-img'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                ]"
              >Multi‑Image Video</button>
              <button
                @click="videoMode = 'keyframes'"
                :class="[
                  'py-2 px-3 rounded-lg text-sm font-medium transition-all',
                  videoMode === 'keyframes'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                ]"
              >Keyframe Animation</button>
            </div>
          </div>

          <!-- Mode-specific inputs -->
          <!-- Image-to-Video: single image URL -->
          <div v-if="videoMode === 'img2vid'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Source Image URL</label>
            <div class="flex space-x-1">
              <input
                v-model="sourceImageInput"
                @keydown.enter="addSourceImage"
                placeholder="Paste image URL..."
                class="flex-1 px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              />
              <button
                @click="addSourceImage"
                :disabled="!sourceImageInput.trim()"
                class="px-3 py-1.5 text-xs bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >Apply</button>
            </div>
            <div v-if="sourceImages.length > 0" class="mt-2 flex items-center space-x-2 px-2 py-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <img :src="sourceImages[0]" class="w-10 h-10 rounded object-cover flex-shrink-0" />
              <span class="flex-1 text-xs text-gray-600 dark:text-gray-400 truncate">{{ sourceImages[0] }}</span>
              <button @click="sourceImages = []" class="text-xs text-red-500 hover:text-red-600 flex-shrink-0">Clear</button>
            </div>
          </div>

          <!-- Multi-Image Video: multiple image URLs -->
          <div v-if="videoMode === 'multi-img'">
            <label class="block text-xs text-indigo-500 dark:text-indigo-400 mb-1">This mode uses keyframes – images will be used as a keyframe sequence</label>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Multiple Image URLs
              <span class="text-xs text-gray-400 ml-1">(in order)</span>
            </label>
            <div class="flex space-x-1">
              <input
                v-model="multiImageInput"
                @keydown.enter="addMultiImage"
                placeholder="Paste image URL..."
                class="flex-1 px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              />
              <button
                @click="addMultiImage"
                :disabled="!multiImageInput.trim()"
                class="px-3 py-1.5 text-xs bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >Add</button>
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
                <button @click="multiImages.splice(idx, 1)" class="text-xs text-red-500 hover:text-red-600 flex-shrink-0">Remove</button>
              </div>
            </div>
          </div>

          <!-- Keyframe Animation: keyframe pairs -->
          <div v-if="videoMode === 'keyframes'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Keyframes
              <span class="text-xs text-gray-400 ml-1">(frame index + image URL)</span>
            </label>
            <div class="space-y-2">
              <div
                v-for="(kf, idx) in keyframes"
                :key="'kf-' + idx"
                class="flex items-center space-x-2 px-2 py-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <img :src="kf.image" class="w-8 h-8 rounded object-cover flex-shrink-0" />
                <span class="text-xs text-gray-500 w-20">Frame {{ kf.frame_index }}</span>
                <span class="flex-1 text-xs text-gray-600 dark:text-gray-400 truncate">{{ kf.image }}</span>
                <button @click="keyframes.splice(idx, 1)" class="text-xs text-red-500 hover:text-red-600 flex-shrink-0">Remove</button>
              </div>
            </div>
            <div class="mt-2 grid grid-cols-3 gap-2">
              <input
                v-model.number="newKeyframeIndex"
                type="number"
                min="0"
                placeholder="Frame index"
                class="px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              />
              <input
                v-model="newKeyframeImage"
                @keydown.enter="addKeyframe"
                placeholder="Image URL"
                class="col-span-1 px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              />
              <button
                @click="addKeyframe"
                :disabled="!newKeyframeImage.trim()"
                class="px-2 py-1.5 text-xs bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >Add</button>
            </div>
          </div>

          <!-- Prompt -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Video Description (Prompt)</label>
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
                Size
                <ParamTip tip="Video resolution.<br><b>Landscape 16:9</b>: 1920×1080 (1080p), 1280×720 (720p), 1152×768 (recommended)<br><b>Portrait 9:16</b>: 1080×1920, 720×1280<br><b>Ultrawide 21:9</b>: 2560×1080<br><b>Square</b>: 1024×1024<br>Recommended: 1152×768 (best cost‑effectiveness for landscape)." title="Size Info" />
              </label>
              <select
                v-model="videoSize"
                :disabled="loading"
                class="w-full px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
              >
                <!-- Landscape 16:9 -->
                <option value="1920x1080">1920 × 1080 (16:9 1080p)</option>
                <option value="1280x720">1280 × 720 (16:9 720p)</option>
                <option value="1152x768">1152 × 768 (recommended)</option>
                <option value="960x540">960 × 540 (16:9)</option>
                <option value="640x360">640 × 360 (16:9)</option>
                <!-- Portrait 9:16 -->
                <option value="1080x1920">1080 × 1920 (9:16 Portrait)</option>
                <option value="720x1280">720 × 1280 (9:16 Portrait)</option>
                <option value="576x1024">576 × 1024 (9:16 Portrait)</option>
                <!-- Ultrawide 21:9 -->
                <option value="2560x1080">2560 × 1080 (21:9 Ultrawide)</option>
                <option value="1920x810">1920 × 810 (21:9)</option>
                <!-- Square -->
                <option value="1024x1024">1024 × 1024 (1:1 Square)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Total Frames
                <ParamTip tip="Total frames, must satisfy 8n+1 ≤ 441. Duration = num_frames ÷ frame_rate. 81 (~3s) fastest for quick preview; 121 (~5s) default recommended; 161 (~7s); 241 (~10s); 441 (~18s) longest and slowest. More frames = longer generation time." title="Total Frames Info" />
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
                Frame Rate (FPS)
                <ParamTip tip="Frames per second, affects smoothness and duration. Range 1‑60. Recommended: 24 for cinematic stability; 30 for smoother; 60 for very smooth but doubles generation time. Duration = num_frames ÷ frame_rate. E.g., 121 frames / 24 FPS ≈ 5s." title="Frame Rate Info" />
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
          </div>

          <!-- Negative prompt -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Negative Prompt
              <ParamTip tip="Describe content you don't want in the video, e.g.: blurry, low quality, distorted, watermark, text, logo, etc. Using English works better. Leave empty to disable." title="Negative Prompt Info" />
            </label>
            <input
              v-model="negativePrompt"
              placeholder="Content you don't want in the video..."
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
              <span class="text-sm text-indigo-600 dark:text-indigo-400">Generating {{ modeLabel }}...</span>
            </div>
            <button
              @click="stopGeneration"
              class="flex items-center space-x-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Stop ({{ progress }}%)</span>
            </button>
          </div>
          <p v-if="!isConfigured" class="text-xs text-amber-500 dark:text-amber-400">
            Please set your API Key in the API configuration
          </p>
        </div>
      </div>

      <!-- Current result -->
      <div v-if="currentVideoUrl" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-between">
          <span>Generated Result</span>
          <a
            :href="currentVideoUrl"
            target="_blank" rel="noopener noreferrer"
            class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center space-x-1"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download</span>
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
          <p class="text-sm text-blue-600 dark:text-blue-400">Generating {{ modeLabel }}{{ progress > 0 ? ` (${progress}%)` : '...' }}</p>
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

    <!-- Mobile: History panel -->
    <Modal :visible="showHistory" title="Video History" @close="showHistory = false">
      <VideoHistory ref="videoHistoryRef" />
    </Modal>

    <!-- Desktop: History panel (hidden on mobile) -->
    <div class="hidden md:block w-72 flex-shrink-0">
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
import Modal from './Modal.vue'

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
const videoSize = ref('1152x768') // unified size format, default recommended
const width = ref(1152)
const height = ref(768)
const negativePrompt = ref('')
const numFrames = ref(121)
const frameRate = ref(24)

// Watch videoSize to update width and height automatically
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
const showHistory = ref(false)

// Computed
const promptPlaceholder = computed(() => {
  switch (videoMode.value) {
    case 'ti2vid': return 'Describe the video content you want to generate...'
    case 'img2vid': return 'Describe how the person/scene in the image should move...'
    case 'multi-img': return 'Describe the smooth animation between the image sequence...'
    case 'keyframes': return 'Describe the animation transition between keyframes...'
    default: return 'Describe the video content you want to generate...'
  }
})

const modeLabel = computed(() => {
  switch (videoMode.value) {
    case 'ti2vid': return 'Video'
    case 'img2vid': return 'Image-to-Video'
    case 'multi-img': return 'Multi-Image Video'
    case 'keyframes': return 'Keyframe Animation'
    default: return 'Video'
  }
})

const generateButtonText = computed(() => {
  switch (videoMode.value) {
    case 'ti2vid': return 'Generate Video'
    case 'img2vid': return 'Generate Image-to-Video'
    case 'multi-img': return 'Generate Multi-Image Video'
    case 'keyframes': return 'Generate Keyframe Animation'
    default: return 'Generate Video'
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
      error.value = `There are already ${pendingVideos} videos in the generation queue, please wait and try again`
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
  const requestBody = {
    model: 'agnes-video-v2.0',
    prompt: prompt.value.trim(),
    width: width.value,
    height: height.value,
    num_frames: numFrames.value,
    frame_rate: frameRate.value,
    negative_prompt: negativePrompt.value.trim() || undefined,
    mode: apiMode.value,
  }

  // Add mode-specific fields
  switch (videoMode.value) {
    case 'img2vid':
      requestBody.image = sourceImages.value[0]
      break
    case 'multi-img':
      requestBody.images = [...multiImages.value]
      requestBody.extra_body = {
        mode: 'keyframes',
        images: [...multiImages.value],
      }
      break
    case 'keyframes':
      requestBody.mode = 'keyframes'
      requestBody.extra_body = {
        mode: 'keyframes',
        keyframes: keyframes.value.map(kf => ({
          frame_index: kf.frame_index,
          image: kf.image,
        })),
      }
      break
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
      throw new Error('Video ID not found in API response')
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
  const requestTimeout = 30000 // 30 seconds per request
  const maxAttempts = 120 // max 120 polls = 10 minutes
  let consecutiveErrors = 0
  let consecutiveEmpty = 0 // consecutive empty response counter

  for (let i = 0; i < maxAttempts; i++) {
    if (cancelled.value) {
      videoHistoryRef.value?.updateVideo(videoId, { status: 'cancelled' })
      loading.value = false
      return
    }

    // Wait for poll interval
    await new Promise(resolve => setTimeout(resolve, pollInterval))

    if (cancelled.value) {
      videoHistoryRef.value?.updateVideo(videoId, { status: 'cancelled' })
      loading.value = false
      return
    }

    try {
      // Use AbortController for request timeout
      const timeoutController = new AbortController()
      const timeoutId = setTimeout(() => timeoutController.abort(), requestTimeout)

      const statusUrl = `${baseUrl.value.replace(/\/+$/, '')}/agnesapi?video_id=${videoId}`
      const statusResponse = await fetch(statusUrl, {
        method: 'GET',
        headers: getHeaders(),
        signal: AbortSignal.any([signal, timeoutController.signal]),
      })

      clearTimeout(timeoutId)

      // Handle 503 queuing: exponential backoff retry
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
          i-- // don't count this as a poll attempt
          continue
        } else {
          throw new Error(`Video generation service busy (503), no response after multiple attempts. Free API may have long queues during peak times; please check back later by refreshing in history.`)
        }
      }

      // Other HTTP errors: also backoff retry
      if (!statusResponse.ok) {
        consecutiveErrors++
        if (consecutiveErrors <= 3) {
          const backoffMs = Math.min(1000 * Math.pow(2, consecutiveErrors), 15000)
          await new Promise(resolve => setTimeout(resolve, backoffMs))
          i-- // don't count this as a poll attempt
          continue
        }
        throw new Error(`Status query failed: ${statusResponse.status}`)
      }

      consecutiveErrors = 0 // reset error counter
      const statusData = await statusResponse.json()

      // Check for empty or invalid response
      if (!statusData || Object.keys(statusData).length === 0) {
        consecutiveEmpty++
        if (consecutiveEmpty >= 3) {
          // 3 consecutive empty responses – might be service issue
          error.value = `Query returned empty result, please check network or try again later (${i + 1}/${maxAttempts})`
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
          // status says completed but no URL yet, continue polling
          continue
        }
      } else if (status === 'failed' || status === 'error') {
        const errMsg = statusData.error || statusData.message || 'Video generation failed'
        throw new Error(errMsg)
      }
      // other statuses (queued, in_progress) – continue polling
    } catch (err) {
      if (err.name === 'AbortError') {
        // request timeout
        consecutiveErrors++
        if (consecutiveErrors <= 3) {
          i-- // don't count this as a poll attempt
          continue
        }
        error.value = 'Network request timeout, please check your connection'
        videoHistoryRef.value?.updateVideo(videoId, {
          status: 'failed',
          error: 'Network request timeout',
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

  // Timeout – don't remove the task; let user refresh in history
  error.value = `Video generation timed out (${maxAttempts * pollInterval / 1000 / 60} minutes). Please refresh in history to check status.`
  videoHistoryRef.value?.updateVideo(videoId, {
    status: 'timeout',
  })
  loading.value = false
}
</script>
