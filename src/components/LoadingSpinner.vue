<template>
  <div class="flex items-center justify-center space-x-2">
    <div
      class="w-3 h-3 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce"
      :style="{ animationDelay: '0ms' }"
    ></div>
    <div
      class="w-3 h-3 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce"
      :style="{ animationDelay: '150ms' }"
    ></div>
    <div
      class="w-3 h-3 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce"
      :style="{ animationDelay: '300ms' }"
    ></div>
  </div>
</template>
