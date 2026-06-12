# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Agnes AI is a single-page Vue 3 application that provides a unified interface to the Agnes AI API (https://apihub.agnes-ai.com), supporting AI-powered **chat**, **image generation**, and **video generation** features. It is built with Vue 3 (Composition API), Vite, and Tailwind CSS, targeting deployment on Vercel.

## Key Commands

```bash
npm install        # Install dependencies
npm run dev        # Start Vite dev server (with API proxy configured)
npm run build      # Production build to dist/
npm run preview    # Preview production build locally
```

## Architecture

### Entry point & routing
- `src/main.js` — mounts the Vue app to `#app` in `index.html`.
- `src/App.vue` — root component with three-tab layout (对话 / 图片 / 视频). Tab switching uses `<Transition mode="out-in">`. A collapsible API config panel sits above the tab content.

### Composables (shared state / logic)
- `src/composables/useApiConfig.js` — singleton pattern providing `baseUrl` (default `/api/agnes`), `apiKey`, `isConfigured`, `saveConfig()`, `getHeaders()`, `formatUrl()`. Persists config to `localStorage` (`agnes-base-url`, `agnes-api-key`). Auto-migrates legacy direct URLs to the proxy path.
- `src/composables/useTheme.js` — dark/light theme toggle. Persists `agnes-theme` to `localStorage`. Uses `dark:` Tailwind classes throughout.

### Components
- **`src/components/ApiConfig.vue`** — modal-like panel to set Base URL and API Key. Uses `useApiConfig`.
- **`src/components/ChatView.vue`** — chat interface with conversation management (sidebar), multi-conversation storage in `localStorage` (`agnes-conversations`), SSE streaming via `fetch` + `ReadableStream` reader, markdown rendering via `marked` with custom code block renderer (includes copy button). Calls `/v1/chat/completions` (model: `agnes-2.0-flash`).
- **`src/components/ImageView.vue`** — image generation UI with two modes: text-to-image and image-to-image. Parameters include prompt, size, inference steps, seed, negative prompt. Calls `/v1/images/generations` (model: `agnes-image-2.1-flash`). Inline history panel via `ImageHistory`.
- **`src/components/ImageHistory.vue`** — sidebar component showing recent generated images with thumbnails, inline preview, full-screen modal (`<Modal>`), edit/delete/clear actions. Emits events to parent.
- **`src/components/VideoView.vue`** — video generation UI with four modes: text-to-video, image-to-video, multi-image-to-video, keyframe animation. Multi-step async flow: POST `/v1/videos` → polling `/agnesapi?video_id=...` every 5s → extract result. Queue limit: max 3 pending videos. Model: `agnes-video-v2.0`.
- **`src/components/VideoHistory.vue`** — persistent video history stored in `localStorage` (`agnes-videos`). Exposes `addVideo()`, `updateVideo()`, `getPendingCount()` via `defineExpose` for parent to call.
- **`src/components/Modal.vue`** — reusable fullscreen overlay with `<Teleport to="body">`, scroll lock on body, slot-based content.
- **`src/components/LoadingSpinner.vue`** — three-dot bounce animation.

### Data persistence
All user data (conversations, images, videos, API config, theme) is stored in `localStorage`. No backend database.

| Key | Contents |
|-----|----------|
| `agnes-base-url` | API base URL (default `/api/agnes`) |
| `agnes-api-key` | API key |
| `agnes-theme` | `dark` or `light` |
| `agnes-conversations` | JSON array of conversation objects |
| `agnes-images` | JSON array of image generation records |
| `agnes-videos` | JSON array of video generation records |

### API & proxy
- **Dev**: Vite proxies `/api/agnes/*` → `https://apihub.agnes-ai.com/*` (`vite.config.js`). This avoids Cloudflare browser connection issues.
- **Production**: Vercel `vercel.json` rewrites `/api/agnes/(.*)` → `https://apihub.agnes-ai.com/$1`. All other routes fall back to `index.html` (SPA).

### Styling
- Tailwind CSS 3.x with `darkMode: 'class'` (class-based dark mode).
- Custom animations: `spin-slow`, `pulse-slow`.
- Global transition on `background-color`, `border-color`, `color` (150ms).
- Custom scrollbar styling, dark variant.

## Development Notes

- The app uses **no build-time environment variables** — API config is user-provided at runtime via `localStorage`.
- Video generation is **asynchronous**: creates a task, polls for status, updates history. Cancellation uses `AbortController` to abort the create request and marks the task as `cancelled`.
- Image generation is **synchronous**: returns the URL directly in the response.
- Chat uses **SSE streaming** with manual `TextDecoder` buffer processing for the typewriter effect.
- Markdown rendering is synchronous (`marked.parse` with `async: false`). Code blocks get a custom renderer with language label and copy button.
- All API calls include `Authorization: Bearer <key>` header.
