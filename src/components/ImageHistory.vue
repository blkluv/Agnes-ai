<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
        历史记录
        <span class="text-xs font-normal text-gray-400 dark:text-gray-500 ml-1">({{ images.length }})</span>
      </h3>
      <div class="flex items-center space-x-2">
        <button
          v-if="images.length > 0"
          @click="showModal = true"
          class="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
        >
          查看全部
        </button>
        <button
          v-if="images.length > 0"
          @click="clearAll"
          class="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
        >
          清空
        </button>
      </div>
    </div>
    
    <div class="overflow-y-auto" style="max-height: 500px;">
      <div v-if="images.length === 0" class="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
        <svg class="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="text-sm">暂无图片</p>
      </div>
      <div
        v-for="(img, idx) in displayedImages"
        :key="idx"
        class="group flex items-start space-x-3 p-3 border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
      >
        <div class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-pointer" @click="openImage(img.url)">
          <img :src="img.url" :alt="img.prompt" class="w-full h-full object-cover" loading="lazy" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 cursor-pointer" :title="img.prompt" @click="openImage(img.url)">{{ img.prompt }}</p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">{{ formatDate(img.createdAt) }}</p>
        </div>
        <div class="flex-shrink-0 flex flex-col space-y-1">
          <button @click="$emit('edit-image', img)" class="p-1.5 bg-indigo-200 dark:bg-indigo-800 hover:bg-indigo-300 dark:hover:bg-indigo-700 rounded text-indigo-700 dark:text-indigo-300 transition-colors" title="以该图为源图编辑生成">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <a :href="img.url" target="_blank" rel="noopener noreferrer" class="p-1.5 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded text-gray-700 dark:text-gray-200 transition-colors" title="在新页签中打开">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </a>
          <button @click="deleteImage(idx)" class="p-1.5 bg-red-200 dark:bg-red-800 hover:bg-red-300 dark:hover:bg-red-700 rounded text-red-700 dark:text-red-300 transition-colors" title="删除">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
      <!-- View more button -->
      <div v-if="images.length > 0" class="p-3 text-center">
        <button
          @click="showModal = true"
          class="w-full py-2 text-sm text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
        >
          查看更多 (共 {{ images.length }} 条)
        </button>
      </div>
    </div>

    <!-- Full-size image preview (inline) -->
    <Teleport to="body">
      <div v-if="previewUrl" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" @click.self="previewUrl = ''">
        <div class="relative max-w-[90vw] max-h-[90vh]">
          <button @click="previewUrl = ''" class="absolute -top-3 -right-3 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <img :src="previewUrl" alt="Preview" class="max-w-full max-h-[90vh] rounded-xl shadow-2xl" />
        </div>
      </div>
    </Teleport>

    <!-- All history modal -->
    <Modal :visible="showModal" title="图片历史记录" @close="showModal = false">
      <div v-if="images.length === 0" class="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
        <svg class="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="text-sm">暂无图片记录</p>
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <div
          v-for="(img, idx) in images"
          :key="'modal-' + idx"
          class="group relative bg-gray-50 dark:bg-gray-900/50 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
        >
          <!-- Image -->
          <div class="aspect-square overflow-hidden bg-gray-200 dark:bg-gray-700 cursor-pointer" @click="openImage(img.url)">
            <img :src="img.url" :alt="img.prompt" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          </div>
          <!-- Info overlay on hover -->
          <div class="p-2">
            <p class="text-xs text-gray-700 dark:text-gray-300 truncate" :title="img.prompt">{{ img.prompt }}</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ formatDate(img.createdAt) }}</p>
          </div>
          <!-- Actions -->
          <div class="absolute top-2 right-2 flex flex-col space-y-1">
            <button @click.stop="$emit('edit-image', img); showModal = false" class="p-1.5 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-indigo-600 dark:text-indigo-400 shadow-sm transition-colors" title="以该图为源图编辑">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
            <a :href="img.url" target="_blank" rel="noopener noreferrer" class="p-1.5 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 shadow-sm transition-colors" title="在新页签中打开">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </a>
            <button @click.stop="deleteImage(idx)" class="p-1.5 bg-white/90 dark:bg-gray-800/90 hover:bg-red-500 dark:hover:bg-red-600 rounded-lg text-red-600 dark:text-red-400 shadow-sm transition-colors" title="删除">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Modal from './Modal.vue'

const props = defineProps({
  images: { type: Array, default: () => [] },
  maxDisplay: { type: Number, default: 5 },
})

const emit = defineEmits(['edit-image', 'delete-image', 'clear-all'])

const showModal = ref(false)
const previewUrl = ref('')

const displayedImages = computed(() => {
  return props.images.slice(0, props.maxDisplay)
})

function openImage(url) {
  previewUrl.value = url
}

function deleteImage(idx) {
  emit('delete-image', idx)
}

function clearAll() {
  if (confirm('确定要清空所有图片记录吗？')) {
    emit('clear-all')
    showModal.value = false
  }
}

function formatDate(ts) {
  return new Date(ts).toLocaleString('zh-CN', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}
</script>
