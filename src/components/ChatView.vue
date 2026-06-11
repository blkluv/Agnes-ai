<template>
  <div class="flex h-[75vh] bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
    <!-- Left sidebar - Conversation list -->
    <div class="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-850">
      <div class="p-3 border-b border-gray-200 dark:border-gray-700">
        <button
          @click="newConversation"
          class="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>新对话</span>
        </button>
      </div>
      <div class="flex-1 overflow-y-auto p-2 space-y-1">
        <div v-if="conversations.length === 0" class="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
          暂无对话
        </div>
        <div
          v-for="(conv, idx) in conversations"
          :key="conv.id"
          @click="switchConversation(idx)"
          :class="[
            'group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-all',
            activeConvIndex === idx
              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent'
          ]"
        >
          <div class="flex-1 min-w-0">
            <p class="truncate font-medium">{{ conv.title || '新对话' }}</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ formatDate(conv.updatedAt) }}</p>
          </div>
          <div class="flex-shrink-0 flex items-center space-x-1">
            <button
              @click.stop="deleteConversation(idx)"
              class="p-1.5 rounded-lg text-red-500 hover:text-white hover:bg-red-500 dark:text-red-400 dark:hover:text-white dark:hover:bg-red-600 transition-colors"
              title="删除对话"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Right panel - Chat area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Chat header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
          {{ currentConversation?.title || 'AI 对话' }}
        </h3>
        <span class="text-xs text-gray-400 dark:text-gray-500">{{ currentMessages.length }} 条消息</span>
      </div>

      <!-- Messages area -->
      <div ref="messagesContainer" @click="handleMessagesClick" class="flex-1 overflow-y-auto p-4 space-y-4">
        <div v-if="currentMessages.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
          <svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p class="text-lg font-medium">开始一段新对话</p>
          <p class="text-sm mt-1">在下方输入您的消息</p>
        </div>
        <div v-for="(msg, idx) in currentMessages" :key="'msg-' + idx" :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']">
          <div
            :class="[
              'max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
              msg.role === 'user'
                ? 'bg-indigo-500 text-white rounded-br-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
            ]"
          >
            <!-- User messages: plain text -->
            <p v-if="msg.role === 'user'" class="whitespace-pre-wrap">{{ msg.content }}</p>
            <!-- AI messages: Markdown rendered -->
            <div v-else class="markdown-body" v-html="renderMarkdown(msg.content)"></div>
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
      <div class="border-t border-gray-200 dark:border-gray-700 p-4">
        <div class="flex space-x-3">
          <input
            v-model="userInput"
            @keydown.enter.prevent="sendMessage"
            placeholder="输入消息..."
            :disabled="loading || !isConfigured"
            class="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            v-if="!loading"
            @click="sendMessage"
            :disabled="!userInput.trim() || !isConfigured"
            class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors duration-200 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
          <!-- Stop button when loading -->
          <button
            v-else
            @click="stopGeneration"
            class="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            title="停止生成"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p v-if="!isConfigured" class="mt-2 text-xs text-amber-500 dark:text-amber-400">
          请先在 API 配置中设置 API Key
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { marked } from 'marked'
import { useApiConfig } from '../composables/useApiConfig'
import LoadingSpinner from './LoadingSpinner.vue'

const { isConfigured, formatUrl, getHeaders } = useApiConfig()

const STORAGE_KEY = 'agnes-conversations'

// State
const conversations = ref([])
const activeConvIndex = ref(0)
const userInput = ref('')
const loading = ref(false)
const abortController = ref(null)
const messagesContainer = ref(null)

// Configure marked with custom renderer
const escapeHtml = (str) => {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const renderer = {
  code({ text, lang }) {
    const langLabel = lang || 'code'
    const encoded = escapeHtml(text)
    return `<div class="code-block-wrapper group relative my-2">
      <div class="flex items-center justify-between px-3 py-1.5 bg-gray-200 dark:bg-gray-600 rounded-t-lg text-xs text-gray-500 dark:text-gray-400">
        <span>${escapeHtml(langLabel)}</span>
        <button class="copy-code-btn flex items-center space-x-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" data-code="${encoded}">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>复制</span>
        </button>
      </div>
      <pre class="rounded-t-none !mt-0"><code class="language-${escapeHtml(lang || '')}">${encoded}</code></pre>
    </div>`
  }
}

marked.use({ renderer, breaks: true, gfm: true })

// Computed
const currentMessages = computed(() => {
  if (conversations.value.length === 0) return []
  return conversations.value[activeConvIndex.value]?.messages || []
})

const currentConversation = computed(() => {
  return conversations.value[activeConvIndex.value] || null
})

// Render markdown to HTML (synchronous)
function renderMarkdown(content) {
  if (!content) return ''
  try {
    const result = marked.parse(content, { async: false })
    return typeof result === 'string' ? result : content
  } catch (e) {
    return content
  }
}

// Delegate click handler for copy buttons
function handleMessagesClick(e) {
  const btn = e.target.closest('.copy-code-btn')
  if (!btn) return
  const code = btn.getAttribute('data-code')
  if (!code) return
  navigator.clipboard.writeText(code).then(() => {
    const span = btn.querySelector('span')
    const original = span.textContent
    span.textContent = '已复制!'
    setTimeout(() => { span.textContent = original }, 1500)
  }).catch(() => {
    alert('复制失败，请手动选择复制')
  })
}

// Load from localStorage
onMounted(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      conversations.value = JSON.parse(saved)
    }
  } catch (e) {
    console.warn('Failed to load conversations:', e)
  }
  if (conversations.value.length === 0) {
    createNewConversation()
  }
})

function saveConversations() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations.value))
}

function createNewConversation() {
  const id = 'conv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
  return {
    id,
    title: '新对话',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

function newConversation() {
  conversations.value.unshift(createNewConversation())
  activeConvIndex.value = 0
  saveConversations()
  nextTick(scrollToBottom)
}

function switchConversation(idx) {
  if (idx >= 0 && idx < conversations.value.length) {
    activeConvIndex.value = idx
    nextTick(scrollToBottom)
  }
}

function deleteConversation(idx) {
  const conv = conversations.value[idx]
  const title = conv.title || '新对话'
  if (!confirm(`确定要删除"${title}"吗？删除后无法恢复。`)) return

  if (conversations.value.length <= 1) {
    conversations.value[0] = createNewConversation()
    activeConvIndex.value = 0
    saveConversations()
    return
  }
  conversations.value.splice(idx, 1)
  if (activeConvIndex.value >= conversations.value.length) {
    activeConvIndex.value = conversations.value.length - 1
  }
  saveConversations()
}

function updateTitle(conv) {
  if (!conv) return
  const firstUserMsg = conv.messages.find(m => m.role === 'user')
  if (firstUserMsg) {
    conv.title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '')
  }
  conv.updatedAt = Date.now()
}

function cleanupEmptyMessage(conv) {
  if (conv && conv.messages.length > 0) {
    const lastMsg = conv.messages[conv.messages.length - 1]
    if (lastMsg.role === 'assistant' && !lastMsg.content) {
      conv.messages.pop()
    }
  }
}

async function scrollToBottom() {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function stopGeneration() {
  if (abortController.value) {
    abortController.value.abort()
    abortController.value = null
    loading.value = false
  }
}

async function sendMessage() {
  const text = userInput.value.trim()
  if (!text || loading.value || !isConfigured.value) return

  userInput.value = ''

  if (conversations.value.length === 0) {
    conversations.value.push(createNewConversation())
    activeConvIndex.value = 0
  }

  const conv = conversations.value[activeConvIndex.value]
  conv.messages.push({ role: 'user', content: text })
  updateTitle(conv)
  saveConversations()
  loading.value = true
  await scrollToBottom()

  abortController.value = new AbortController()

  try {
    const response = await fetch(formatUrl('/v1/chat/completions'), {
      method: 'POST',
      headers: getHeaders(),
      signal: abortController.value.signal,
      body: JSON.stringify({
        model: 'agnes-2.0-flash',
        stream: true,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          ...conv.messages.map(m => ({ role: m.role, content: m.content }))
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`API Error: ${response.status} - ${err}`)
    }

    // Handle SSE stream — creates typewriter effect naturally
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let fullContent = ''

    // Add placeholder assistant message, updated as chunks arrive
    conv.messages.push({ role: 'assistant', content: '' })
    const msgIdx = conv.messages.length - 1

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // Process complete SSE lines
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue

        const dataStr = trimmed.slice(6)
        if (dataStr === '[DONE]') continue

        try {
          const chunk = JSON.parse(dataStr)
          const delta = chunk.choices?.[0]?.delta?.content
          if (delta) {
            fullContent += delta
            conv.messages[msgIdx].content = fullContent
            await scrollToBottom()
          }
        } catch (e) {
          // Skip malformed JSON
        }
      }
    }

    if (fullContent) {
      conv.messages[msgIdx].content = fullContent
      updateTitle(conv)
      saveConversations()
    } else {
      // Empty response — remove placeholder
      conv.messages.pop()
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      cleanupEmptyMessage(conv)
      saveConversations()
      return
    }
    cleanupEmptyMessage(conv)
    conv.messages.push({
      role: 'assistant',
      content: `错误: ${err.message}. 请检查 API 配置是否正确。`,
    })
    saveConversations()
  } finally {
    loading.value = false
    abortController.value = null
    await scrollToBottom()
  }
}

function formatDate(ts) {
  return new Date(ts).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
:deep(.markdown-body) {
  font-size: 0.875rem;
  line-height: 1.625;
  color: inherit;
  word-break: break-word;
}
:deep(.markdown-body p) {
  margin: 0;
  margin-bottom: 0.5rem;
}
:deep(.markdown-body p:last-child) {
  margin-bottom: 0;
}
:deep(.markdown-body ul),
:deep(.markdown-body ol) {
  padding-left: 1.25rem;
  margin: 0.25rem 0;
}
:deep(.markdown-body li) {
  margin-bottom: 0.25rem;
}
:deep(.markdown-body strong) {
  font-weight: 600;
}
:deep(.markdown-body em) {
  font-style: italic;
}
:deep(.markdown-body code) {
  background: rgba(0, 0, 0, 0.08);
  padding: 0.15em 0.35em;
  border-radius: 0.25rem;
  font-size: 0.8em;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
}
:deep(.dark .markdown-body code) {
  background: rgba(255, 255, 255, 0.1);
}
:deep(.markdown-body pre) {
  background: rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  overflow-x: auto;
  margin: 0.5rem 0;
}
:deep(.dark .markdown-body pre) {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.08);
}
:deep(.markdown-body .code-block-wrapper pre) {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  margin-top: 0;
}
:deep(.markdown-body pre code) {
  background: none;
  padding: 0;
  border-radius: 0;
  font-size: 0.8em;
  line-height: 1.5;
}

/* Code block copy button */
:deep(.copy-code-btn) {
  cursor: pointer;
  font-family: inherit;
}
:deep(.copy-code-btn:active) {
  transform: scale(0.95);
}

/* Links - bright blue and clickable */
:deep(.markdown-body a) {
  color: #2563eb;
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
}
:deep(.markdown-body a:hover) {
  color: #1d4ed8;
  text-decoration: none;
}
:deep(.dark .markdown-body a) {
  color: #60a5fa;
}
:deep(.dark .markdown-body a:hover) {
  color: #93bbfd;
}
:deep(.markdown-body a:active) {
  opacity: 0.8;
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
:deep(.markdown-body a) {
  color: #6366f1;
  text-decoration: underline;
  text-underline-offset: 2px;
}
:deep(.markdown-body table) {
  border-collapse: collapse;
  margin: 0.5rem 0;
  font-size: 0.8em;
  width: 100%;
}
:deep(.markdown-body th),
:deep(.markdown-body td) {
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 0.4rem 0.6rem;
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
  margin: 0.75rem 0;
}
:deep(.dark .markdown-body hr) {
  border-top-color: rgba(255, 255, 255, 0.1);
}
:deep(.markdown-body h1),
:deep(.markdown-body h2),
:deep(.markdown-body h3),
:deep(.markdown-body h4) {
  font-weight: 600;
  margin: 0.75rem 0 0.5rem;
  line-height: 1.3;
}
:deep(.markdown-body h1) { font-size: 1.2em; }
:deep(.markdown-body h2) { font-size: 1.1em; }
:deep(.markdown-body h3) { font-size: 1em; }
:deep(.markdown-body h4) { font-size: 0.95em; }
:deep(.markdown-body img) {
  max-width: 100%;
  border-radius: 0.375rem;
  margin: 0.5rem 0;
}
</style>
