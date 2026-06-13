<template>
  <div class="chat-container flex flex-1 min-h-0 w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
    <!-- Mobile sidebar overlay -->
    <Transition name="fade">
      <div
        v-if="showSidebar"
        class="md:hidden fixed inset-0 bg-black/50 z-30"
        @click="showSidebar = false"
      ></div>
    </Transition>

    <!-- Desktop sidebar - Conversation list -->
    <aside
      class="hidden md:flex w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 flex-col bg-gray-50 dark:bg-gray-900"
    >
      <!-- Sidebar header -->
      <div class="p-3 border-b border-gray-200 dark:border-gray-700">
        <button
          @click="newConversation"
          class="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>新对话</span>
        </button>
      </div>

      <!-- Conversation list -->
      <div class="flex-1 overflow-y-auto p-2 space-y-1">
        <div v-if="conversations.length === 0" class="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
          暂无对话
        </div>
        <div
          v-for="(conv, idx) in conversations"
          :key="conv.id"
          @click="switchConversation(idx)"
          :class="[
            'group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-all',
            activeConvIndex === idx
              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
          ]"
        >
          <svg class="w-4 h-4 flex-shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <div class="flex-1 min-w-0">
            <p class="truncate font-medium">{{ conv.title || '新对话' }}</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ formatDate(conv.updatedAt) }}</p>
          </div>
          <button
            @click.stop="confirmDeleteConversation(idx)"
            class="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            title="删除对话"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Mobile: Conversation list modal -->
    <Modal :visible="showSidebar" title="对话列表" @close="showSidebar = false">
      <div class="space-y-1">
        <button
          @click="newConversation(); showSidebar = false"
          class="w-full flex items-center justify-center gap-2 px-3 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors mb-3"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>新对话</span>
        </button>
        <div v-if="conversations.length === 0" class="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
          暂无对话
        </div>
        <div
          v-for="(conv, idx) in conversations"
          :key="'m-'+conv.id"
          @click="switchConversation(idx); showSidebar = false"
          :class="[
            'flex items-center gap-2 px-3 py-3 rounded-lg cursor-pointer text-sm transition-all',
            activeConvIndex === idx
              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
          ]"
        >
          <svg class="w-4 h-4 flex-shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <div class="flex-1 min-w-0">
            <p class="truncate font-medium">{{ conv.title || '新对话' }}</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ formatDate(conv.updatedAt) }}</p>
          </div>
          <button
            @click.stop="confirmDeleteConversation(idx)"
            class="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            title="删除对话"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </Modal>

    <!-- Delete confirmation dialog -->
    <ConfirmDialog
      :visible="confirmDelete.show"
      title="确认删除"
      message="确定要删除这个对话吗？此操作不可撤销。"
      @confirm="deleteConfirmed"
      @cancel="cancelDeleteConv"
    />

    <!-- Right panel - Chat area -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Chat header -->
      <header class="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
        <button
          @click="showSidebar = !showSidebar"
          class="md:hidden p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {{ currentConversation?.title || 'AI 对话' }}
          </h3>
          <p class="text-xs text-gray-400 dark:text-gray-500">{{ currentMessages.length }} 条消息</p>
        </div>
      </header>

      <!-- Messages area -->
      <div ref="messagesContainer" class="messages-container flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <!-- Empty state -->
        <div v-if="currentMessages.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
          <div class="w-16 h-16 mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p class="text-lg font-medium text-gray-600 dark:text-gray-300">开始一段新对话</p>
          <p class="text-sm mt-1">在下方输入您的消息</p>
        </div>

        <!-- Messages -->
        <div
          v-for="(msg, idx) in currentMessages"
          :key="'msg-' + idx"
          :class="['message-row flex', msg.role === 'user' ? 'justify-end' : 'justify-start']"
        >
          <div
            :class="[
              'message-bubble max-w-[85%] lg:max-w-[70%]',
              msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-2xl rounded-br-md px-4 py-2.5'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl rounded-bl-md px-4 py-2.5'
            ]"
          >
            <!-- User messages: plain text -->
            <p v-if="msg.role === 'user'" class="whitespace-pre-wrap text-sm leading-relaxed">{{ msg.content }}</p>
            <!-- AI messages: Markdown rendered -->
            <div v-else class="markdown-body text-sm leading-relaxed" v-html="renderMarkdown(msg.content)"></div>
          </div>
        </div>

        <!-- Loading indicator -->
        <div v-if="loading" class="flex justify-start">
          <div class="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
            <LoadingSpinner />
          </div>
        </div>
      </div>

      <!-- Input area -->
      <div class="input-area border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 sm:p-4 flex-shrink-0" style="padding-bottom: max(0.75rem, env(safe-area-inset-bottom, 0.75rem))">
        <div class="flex items-end gap-2 sm:gap-3">
          <textarea
            ref="inputRef"
            v-model="userInput"
            @keydown.enter.exact="handleEnter"
            @input="autoResize"
            placeholder="输入消息..."
            :disabled="loading || !isConfigured"
            rows="1"
            class="flex-1 resize-none px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm leading-relaxed max-h-32 overflow-y-auto"
          ></textarea>
          <button
            v-if="!loading"
            @click="sendMessage"
            :disabled="!userInput.trim() || !isConfigured"
            class="flex-shrink-0 p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-xl transition-colors duration-200 disabled:cursor-not-allowed"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
          <button
            v-else
            @click="stopGeneration"
            class="flex-shrink-0 p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors duration-200"
            title="停止生成"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p v-if="!isConfigured" class="mt-2 text-xs text-amber-500 dark:text-amber-400 text-center">
          请先在 API 配置中设置 API Key
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { marked } from 'marked'
import { useApiConfig } from '../composables/useApiConfig'
import LoadingSpinner from './LoadingSpinner.vue'
import Modal from './Modal.vue'
import ConfirmDialog from './ConfirmDialog.vue'

const { isConfigured, formatUrl, getHeaders } = useApiConfig()

const STORAGE_KEY = 'agnes-conversations'

// State
const conversations = ref([])
const activeConvIndex = ref(0)
const userInput = ref('')
const loading = ref(false)
const abortController = ref(null)
const messagesContainer = ref(null)
const inputRef = ref(null)
const showSidebar = ref(false)

// Confirm dialog state
const confirmDelete = ref({ show: false, idx: null })

// Configure marked with custom renderer
const escapeHtml = (str) => {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const renderer = {
  code({ text, lang }) {
    const langLabel = lang || 'code'
    const encoded = escapeHtml(text)
    return `<div class="code-block-wrapper group relative my-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
      <div class="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400">
        <span class="font-medium">${escapeHtml(langLabel)}</span>
        <button class="copy-code-btn flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" data-code="${encoded}">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>复制</span>
        </button>
      </div>
      <pre class="!m-0 !bg-gray-50 dark:!bg-gray-800 !rounded-none border-0"><code class="language-${escapeHtml(lang || '')} text-sm">${encoded}</code></pre>
    </div>`
  }
}

marked.use({ renderer, breaks: true, gfm: true })

// Computed
const currentConversation = computed(() => conversations.value[activeConvIndex.value] || null)
const currentMessages = computed(() => currentConversation.value?.messages || [])

// Methods
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`
  return d.toLocaleDateString('zh-CN')
}

const renderMarkdown = (content) => {
  if (!content) return ''
  try {
    return marked.parse(content)
  } catch (e) {
    return escapeHtml(content)
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const autoResize = () => {
  const textarea = inputRef.value
  if (!textarea) return
  textarea.style.height = 'auto'
  textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px'
}

const handleEnter = (e) => {
  if (!e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

const loadConversations = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      conversations.value = JSON.parse(saved)
    }
    if (conversations.value.length === 0) {
      newConversation()
    }
  } catch (e) {
    console.error('Failed to load conversations:', e)
    newConversation()
  }
}

const saveConversations = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations.value))
  } catch (e) {
    console.error('Failed to save conversations:', e)
  }
}

const newConversation = () => {
  const conv = {
    id: Date.now().toString(),
    title: '新对话',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  conversations.value.unshift(conv)
  activeConvIndex.value = 0
  saveConversations()
}

const switchConversation = (idx) => {
  activeConvIndex.value = idx
}

const confirmDeleteConversation = (idx) => {
  confirmDelete.value = { show: true, idx }
}

const cancelDeleteConv = () => {
  confirmDelete.value = { show: false, idx: null }
}

const deleteConfirmed = () => {
  const idx = confirmDelete.value.idx
  if (idx === null) return

  if (conversations.value.length <= 1) {
    newConversation()
    conversations.value = conversations.value.slice(1)
    activeConvIndex.value = 0
  } else {
    conversations.value.splice(idx, 1)
    if (activeConvIndex.value >= conversations.value.length) {
      activeConvIndex.value = conversations.value.length - 1
    }
  }
  saveConversations()
  confirmDelete.value = { show: false, idx: null }
}

const handleMessagesClick = (e) => {
  if (e.target.closest('.copy-code-btn')) {
    const btn = e.target.closest('.copy-code-btn')
    const code = btn.dataset.code
    if (code) {
      navigator.clipboard.writeText(code).then(() => {
        const span = btn.querySelector('span')
        const originalText = span.textContent
        span.textContent = '已复制'
        setTimeout(() => { span.textContent = originalText }, 2000)
      })
    }
  }
}

const sendMessage = async () => {
  const content = userInput.value.trim()
  if (!content || loading.value || !isConfigured.value) return

  if (!currentConversation.value) {
    newConversation()
  }

  const conv = currentConversation.value
  if (conv.title === '新对话' || conv.title === '') {
    conv.title = content.slice(0, 30) + (content.length > 30 ? '...' : '')
  }

  conv.messages.push({ role: 'user', content })
  conv.updatedAt = new Date().toISOString()
  userInput.value = ''
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
  }
  loading.value = true
  saveConversations()
  await scrollToBottom()

  try {
    abortController.value = new AbortController()
    const response = await fetch(formatUrl('/v1/chat/completions'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getHeaders()
      },
      body: JSON.stringify({
        model: 'agnes-2.0-flash',
        messages: conv.messages.map(m => ({ role: m.role, content: m.content })),
        stream: true
      }),
      signal: abortController.value.signal
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    conv.messages.push({ role: 'assistant', content: '' })
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data:')) continue
        const data = trimmed.slice(5).trim()
        if (data === '[DONE]') continue

        try {
          const json = JSON.parse(data)
          const delta = json.choices?.[0]?.delta?.content
          if (delta) {
            conv.messages[conv.messages.length - 1].content += delta
            await scrollToBottom()
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }

    conv.updatedAt = new Date().toISOString()
    saveConversations()
  } catch (err) {
    if (err.name === 'AbortError') {
      if (conv.messages.length > 0 && conv.messages[conv.messages.length - 1].role === 'assistant') {
        conv.messages[conv.messages.length - 1].content += '\n\n[生成已停止]'
      }
    } else {
      conv.messages.push({
        role: 'assistant',
        content: `错误: ${err.message || '请求失败'}`
      })
    }
    conv.updatedAt = new Date().toISOString()
    saveConversations()
  } finally {
    loading.value = false
    abortController.value = null
    await scrollToBottom()
  }
}

const stopGeneration = () => {
  if (abortController.value) {
    abortController.value.abort()
  }
}

// Initialize
onMounted(() => {
  loadConversations()
})

watch(conversations, saveConversations, { deep: true })
</script>

<style scoped>
/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Code block styling */
:deep(.markdown-body) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  word-wrap: break-word;
  overflow-wrap: break-word;
  overflow: hidden;
}

:deep(.markdown-body pre) {
  background: transparent;
  padding: 0;
  margin: 0.5rem 0;
  overflow: hidden;
}

:deep(.markdown-body pre code) {
  display: block;
  padding: 1rem;
  background: rgb(243 244 246);
  border-radius: 0.5rem;
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.5;
}

:deep(.dark .markdown-body pre code) {
  background: rgb(31 41 55);
}

:deep(.markdown-body p) {
  margin: 0.5rem 0;
}

:deep(.markdown-body p:first-child) {
  margin-top: 0;
}

:deep(.markdown-body p:last-child) {
  margin-bottom: 0;
}

:deep(.markdown-body ul),
:deep(.markdown-body ol) {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

:deep(.markdown-body li) {
  margin: 0.25rem 0;
}

:deep(.markdown-body code:not(pre code)) {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

:deep(.dark .markdown-body code:not(pre code)) {
  background: rgba(99, 102, 241, 0.2);
  color: #818cf8;
}

:deep(.markdown-body a) {
  color: #6366f1;
  text-decoration: underline;
  text-underline-offset: 2px;
}

:deep(.markdown-body a:hover) {
  color: #4f46e5;
}

:deep(.dark .markdown-body a) {
  color: #818cf8;
}

:deep(.dark .markdown-body a:hover) {
  color: #a5b4fc;
}

:deep(.markdown-body blockquote) {
  border-left: 3px solid rgba(99, 102, 241, 0.4);
  padding-left: 0.75rem;
  margin: 0.5rem 0;
  color: rgba(0, 0, 0, 0.55);
}

:deep(.dark .markdown-body blockquote) {
  color: rgba(255, 255, 255, 0.55);
}

:deep(.markdown-body table) {
  border-collapse: collapse;
  margin: 0.75rem 0;
  font-size: 0.875em;
  width: 100%;
  overflow: hidden;
}

:deep(.markdown-body th),
:deep(.markdown-body td) {
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0.75rem;
  text-align: left;
}

:deep(.dark .markdown-body th),
:deep(.dark .markdown-body td) {
  border-color: rgba(255, 255, 255, 0.1);
}

:deep(.markdown-body th) {
  background: rgba(0, 0, 0, 0.04);
  font-weight: 600;
}

:deep(.dark .markdown-body th) {
  background: rgba(255, 255, 255, 0.05);
}

:deep(.markdown-body hr) {
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  margin: 1rem 0;
}

:deep(.dark .markdown-body hr) {
  border-top-color: rgba(255, 255, 255, 0.1);
}

:deep(.markdown-body h1),
:deep(.markdown-body h2),
:deep(.markdown-body h3),
:deep(.markdown-body h4) {
  font-weight: 600;
  margin: 1rem 0 0.5rem;
  line-height: 1.3;
}

:deep(.markdown-body h1) { font-size: 1.25em; }
:deep(.markdown-body h2) { font-size: 1.15em; }
:deep(.markdown-body h3) { font-size: 1.05em; }
:deep(.markdown-body h4) { font-size: 1em; }

:deep(.markdown-body img) {
  max-width: 100%;
  border-radius: 0.5rem;
  margin: 0.5rem 0;
}

/* Scrollbar styling */
.messages-container::-webkit-scrollbar,
.sidebar-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track,
.sidebar-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb,
.sidebar-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover,
.sidebar-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

:dark .messages-container::-webkit-scrollbar-thumb,
:dark .sidebar-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

:dark .messages-container::-webkit-scrollbar-thumb:hover,
:dark .sidebar-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Input textarea */
textarea:focus {
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}
</style>
