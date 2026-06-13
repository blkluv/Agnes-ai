<template>
  <div class="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
    <!-- Left: Generation panel -->
    <div class="flex-1 space-y-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg class="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="flex-1">AI 图片生成</span>
          <button
            v-if="images.length > 0"
            @click="showHistory = !showHistory"
            class="md:hidden p-1.5 rounded-lg text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
            title="历史记录"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </h3>

        <div class="space-y-4">
          <!-- Mode selector -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">模式</label>
            <div class="flex space-x-2">
              <button
                @click="mode = 'text-to-image'"
                :class="[
                  'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all',
                  mode === 'text-to-image'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                ]"
              >
                文生图
              </button>
              <button
                @click="mode = 'image-to-image'"
                :class="[
                  'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all',
                  mode === 'image-to-image'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                ]"
              >
                图生图
              </button>
            </div>
          </div>

          <!-- Source image (img2img mode) -->
          <div v-if="mode === 'image-to-image'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              源图片
              <button
                v-if="sourceImage"
                @click="sourceImage = ''"
                class="ml-2 text-xs text-red-500 hover:text-red-600"
              >清除</button>
            </label>
            <div class="space-y-2">
              <!-- Image preview -->
              <div
                class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
                :class="{ 'hover:border-indigo-400 dark:hover:border-indigo-500': !sourceImage }"
              >
                <img
                  v-if="sourceImage"
                  :src="sourceImage"
                  alt="Source image"
                  class="w-full h-40 object-contain bg-gray-50 dark:bg-gray-900"
                />
                <div v-else class="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-gray-500">
                  <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p class="text-sm">点击右侧历史记录中的编辑按钮</p>
                  <p class="text-xs mt-1">或输入图片 URL</p>
                </div>
              </div>
              <!-- Current source URL display -->
              <div v-if="sourceImage" class="flex items-start space-x-1 px-2 py-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <span class="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 leading-4">URL:</span>
                <a
                  :href="sourceImage"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex-1 text-xs text-indigo-600 dark:text-indigo-400 break-all hover:underline min-w-0 leading-4"
                >{{ sourceImage }}</a>
                <button
                  @click="copySourceUrl"
                  class="flex-shrink-0 p-1 rounded text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="复制链接"
                >
                  <svg v-if="!copied" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <svg v-else class="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
              <!-- URL input to replace -->
              <div class="flex space-x-1">
                <input
                  v-model="sourceImageInput"
                  @keydown.enter="applySourceImage"
                  :placeholder="sourceImage ? '更换源图片 URL...' : '粘贴图片 URL...'"
                  class="flex-1 px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
                <button
                  @click="applySourceImage"
                  :disabled="!sourceImageInput.trim()"
                  class="px-3 py-1.5 text-xs bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  确认
                </button>
              </div>
            </div>
          </div>

          <!-- Prompt -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">图片描述 (Prompt)</label>
            <textarea
              v-model="prompt"
              placeholder="描述你想要生成的图片..."
              :disabled="loading"
              rows="2"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-50 resize-none text-sm"
            ></textarea>
          </div>

          <!-- Parameters -->
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              尺寸
              <ParamTip tip="图片输出的像素尺寸。支持多种常用尺寸：<br><b>方形</b>：1024×1024、512×512<br><b>横屏 16:9</b>：1920×1080、1280×720、1024×576<br><b>竖屏 9:16</b>：1080×1920、720×1280<br><b>横屏 4:3</b>：1600×1200、1024×768<br><b>超宽屏 21:9</b>：2560×1080<br>推荐：1024×1024（通用）、1920×1080（高清横屏）、1080×1920（竖屏）" title="尺寸说明" />
            </label>
            <select
              v-model="size"
              :disabled="loading"
              class="w-full px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
            >
              <!-- 方形 -->
              <option value="1024x1024">1024 × 1024 (1:1 方形)</option>
              <option value="512x512">512 × 512 (1:1 小图)</option>
              <!-- 横屏 16:9 -->
              <option value="1920x1080">1920 × 1080 (16:9 全高清)</option>
              <option value="1280x720">1280 × 720 (16:9 HD)</option>
              <option value="1024x576">1024 × 576 (16:9)</option>
              <!-- 竖屏 9:16 -->
              <option value="1080x1920">1080 × 1920 (9:16 竖屏)</option>
              <option value="720x1280">720 × 1280 (9:16 竖屏)</option>
              <!-- 横屏 4:3 -->
              <option value="1600x1200">1600 × 1200 (4:3 横屏)</option>
              <option value="1024x768">1024 × 768 (4:3 横屏)</option>
              <!-- 超宽屏 21:9 -->
              <option value="2560x1080">2560 × 1080 (21:9 超宽)</option>
            </select>
          </div>
          <!-- Negative prompt -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              负面提示词 (Negative Prompt)
              <ParamTip tip="描述你不希望出现在图片中的内容，例如：blurry, low quality, distorted, watermark, extra fingers 等。使用英文效果更佳。留空则不启用。" title="负面提示词说明" />
            </label>
            <input
              v-model="negativePrompt"
              placeholder="不想出现在图片中的内容..."
              :disabled="loading"
              class="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
            />
          </div>

          <!-- Generate button (when not loading) -->
          <button
            v-if="!loading"
            @click="generateImage"
            :disabled="(!prompt.trim() && mode !== 'image-to-image') || !isConfigured || (mode === 'image-to-image' && !sourceImage)"
            class="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 text-sm"
          >
            <span>生成图片</span>
          </button>
          <!-- Loading state: spinner + stop button together -->
          <div v-if="loading" class="flex items-center justify-between px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
            <div class="flex items-center space-x-3">
              <LoadingSpinner />
              <span class="text-sm text-indigo-600 dark:text-indigo-400">正在生成图片...</span>
            </div>
            <button
              @click="stopGeneration"
              class="flex items-center space-x-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>停止</span>
            </button>
          </div>
          <p v-if="!isConfigured" class="text-xs text-amber-500 dark:text-amber-400">
            请先在 API 配置中设置 API Key
          </p>
        </div>
      </div>

      <!-- Current result -->
      <div v-if="currentImage" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-between">
          <span>生成结果</span>
          <a
            :href="currentImage"
            download="agnes-generated-image.png"
            class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center space-x-1"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>下载</span>
          </a>
        </h4>
        <div class="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
          <img :src="currentImage" alt="Generated image" class="w-full h-auto cursor-pointer" @click="openPreview(currentImage)" />
        </div>
      </div>

      <!-- Error message -->
      <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
        <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
      </div>
    </div>

    <!-- Mobile: History panel -->
    <Modal :visible="showHistory" title="历史记录" @close="showHistory = false">
      <ImageHistory
        :images="images"
        @edit-image="handleEditImage"
        @delete-image="handleDeleteImage"
        @clear-all="handleClearAll"
      />
    </Modal>

    <!-- Desktop: History panel (hidden on mobile) -->
    <div class="hidden md:block w-72 flex-shrink-0">
      <ImageHistory
        :images="images"
        @edit-image="handleEditImage"
        @delete-image="handleDeleteImage"
        @clear-all="handleClearAll"
      />
    </div>

    <!-- Full-size preview modal -->
    <Teleport to="body">
      <div
        v-if="previewUrl"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        @click.self="previewUrl = ''"
      >
        <div class="relative max-w-[90vw] max-h-[90vh]">
          <button
            @click="previewUrl = ''"
            class="absolute -top-3 -right-3 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors z-10"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img :src="previewUrl" alt="Preview" class="max-w-full max-h-[90vh] rounded-xl shadow-2xl" />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApiConfig } from '../composables/useApiConfig'
import ImageHistory from './ImageHistory.vue'
import LoadingSpinner from './LoadingSpinner.vue'
import ParamTip from './ParamTip.vue'
import Modal from './Modal.vue'

const { isConfigured, formatUrl, getHeaders } = useApiConfig()

// Mode
const mode = ref('text-to-image')

// Params
const prompt = ref('')
const size = ref('1024x768')
const negativePrompt = ref('')
const sourceImage = ref('')
const sourceImageInput = ref('')

// State
const loading = ref(false)
const abortController = ref(null)
const currentImage = ref('')
const error = ref('')
const previewUrl = ref('')
const copied = ref(false)
const showHistory = ref(false)

// History
const images = ref([])

onMounted(() => {
  try {
    const saved = localStorage.getItem('agnes-images')
    if (saved) {
      images.value = JSON.parse(saved)
    }
  } catch (e) {}
})

function saveImages() {
  localStorage.setItem('agnes-images', JSON.stringify(images.value))
}

function applySourceImage() {
  const url = sourceImageInput.value.trim()
  if (url) {
    sourceImage.value = url
    sourceImageInput.value = ''
  }
}

function copySourceUrl() {
  if (!sourceImage.value) return
  navigator.clipboard.writeText(sourceImage.value).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 1500)
  }).catch(() => {
    alert('复制失败')
  })
}

async function handleEditImage(img) {
  mode.value = 'image-to-image'
  sourceImage.value = img.url
  // API 生成的图片 URL 是临时的，过一段时间会过期。
  // 尝试转成 base64 Data URI（永久有效），供图生图接口使用。
  fetchImageAsDataURL(img.url).then(dataUrl => {
    if (dataUrl) sourceImage.value = dataUrl
  })
}

async function fetchImageAsDataURL(url) {
  try {
    const resp = await fetch(url)
    const blob = await resp.blob()
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Convert failed'))
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

function handleDeleteImage(idx) {
  images.value.splice(idx, 1)
  saveImages()
}

function handleClearAll() {
  images.value = []
  saveImages()
}

function openPreview(url) {
  previewUrl.value = url
}

function stopGeneration() {
  if (abortController.value) {
    abortController.value.abort()
    abortController.value = null
    loading.value = false
  }
}

async function generateImage() {
  if (!prompt.value.trim() || loading.value || !isConfigured.value) return
  if (mode.value === 'image-to-image' && !sourceImage.value) return

  loading.value = true
  currentImage.value = ''
  error.value = ''

  try {
    const body = {
      model: 'agnes-image-2.1-flash',
      prompt: prompt.value.trim(),
      n: 1,
      size: size.value,
      extra_body: {
        response_format: 'url',
      },
    }

    if (negativePrompt.value.trim()) {
      body.extra_body.negative_prompt = negativePrompt.value.trim()
    }
    // For image-to-image, add the source image inside extra_body as array (per Agnes API spec)
    if (mode.value === 'image-to-image' && sourceImage.value) {
      body.extra_body.image = [sourceImage.value]
    }

    // Create AbortController for cancellation
    abortController.value = new AbortController()

    const response = await fetch(formatUrl('/v1/images/generations'), {
      method: 'POST',
      headers: getHeaders(),
      signal: abortController.value.signal,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`API Error: ${response.status} - ${err}`)
    }

    const data = await response.json()
    const imageUrl = data.data?.[0]?.url

    if (imageUrl) {
      currentImage.value = imageUrl
      images.value.unshift({
        url: imageUrl,
        prompt: prompt.value.trim(),
        mode: mode.value,
        params: {
          size: size.value,
          negativePrompt: negativePrompt.value,
          sourceImage: sourceImage.value || '',
        },
        createdAt: Date.now(),
      })
      saveImages()
    } else {
      throw new Error('API 返回中未找到图片 URL')
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      // User cancelled
      return
    }
    error.value = err.message
  } finally {
    loading.value = false
    abortController.value = null
  }
}
</script>
