<template>
  <div class="relative inline-flex items-center">
    <button
      type="button"
      class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 hover:bg-indigo-100 dark:hover:bg-indigo-900 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-150 cursor-help flex-shrink-0"
      @mouseenter="show = true"
      @mouseleave="show = false"
      @focus="show = true"
      @blur="show = false"
      :aria-label="tip"
      tabindex="0"
    >
      <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
      </svg>
    </button>
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="show"
        class="absolute left-0 bottom-full mb-1.5 z-50 w-64 sm:w-72 p-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 text-xs leading-relaxed"
      >
        <div class="font-medium text-gray-900 dark:text-white mb-1">{{ title }}</div>
        <div v-html="tipHtml" class="text-gray-600 dark:text-gray-400"></div>
        <!-- Arrow -->
        <div class="absolute left-3 top-full w-2 h-2 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-600 rotate-45 -mt-1"></div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  tip: { type: String, required: true },
})

const show = ref(false)

const tipHtml = computed(() => {
  return props.tip.replace(/\n/g, '<br>')
})
</script>
