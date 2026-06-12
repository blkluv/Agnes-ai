# Agnes AI - Cloudflare Workers 部署文档

## 🚀 部署地址

| 类型 | 地址 |
|------|------|
| **自定义域名** | [agnes.fanko.kdns.fr](https://agnes.fanko.kdns.fr) |
| Workers.dev | [agnes-ai.3180806542.workers.dev](https://agnes-ai.3180806542.workers.dev) |

---

## 📋 项目概述

Agnes AI 是一个 Vue 3 + Vite 单页应用，部署在 **Cloudflare Workers** 上，调用 [Agnes AI API](https://apihub.agnes-ai.com) 提供 AI 对话、图片生成、视频生成三大功能。

### 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Vue 3 (Composition API) | ^3.4 |
| 构建工具 | Vite | ^5.1 |
| CSS 框架 | Tailwind CSS | ^3.4 |
| Markdown 渲染 | marked | ^18.0 |
| 部署平台 | Cloudflare Workers | — |
| CLI 工具 | Wrangler | ^4.100 |
| API 代理 | Worker 内置 fetch → | apihub.agnes-ai.com |

---

## 🏗️ 项目架构

```
用户浏览器
    │
    ▼
Cloudflare Worker (agnes-ai)
    │
    ├── /api/agnes/*     → 代理到 https://apihub.agnes-ai.com/*
    │                         (保留原始 method / headers / body)
    │                         (支持 SSE 流式传输)
    │
    └── /* (静态资源)    → dist/ 目录 (Vue SPA)
         └── 404 不走     → index.html (SPA fallback)
```

### 关键文件

| 文件 | 说明 |
|------|------|
| `worker/index.js` | Worker 入口：API 代理 + 静态资源分发 |
| `wrangler.jsonc` | Cloudflare 配置：路由、域名、兼容日期 |
| `package.json` | 依赖管理 + 构建/部署脚本 |
| `vite.config.js` | Vite 开发服务器（含 /api/agnes 代理） |
| `.gitignore` | 排除 `node_modules/` `dist/` `.wrangler/` `.env` |

---

## 🔧 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev
# 运行在 http://localhost:5173
# Vite 自动代理 /api/agnes → https://apihub.agnes-ai.com
```

---

## 🚀 部署到 Cloudflare

### 一、登录 (首次必须)

> ⚠️ **Windows 用户注意**：`wrangler login` 的浏览器 OAuth 方式在 Windows 上经常失败（localhost 回调无法到达）。推荐使用 **API Token** 方式。

#### 方式 A：API Token（推荐，稳定）

```bash
# 1. 获取 Token
# 打开 https://dash.cloudflare.com/profile/api-tokens
# 创建令牌 → 选择「编辑 Cloudflare Workers」模板 → 复制 Token

# 2. 在终端设置环境变量（bash 语法）
export CLOUDFLARE_API_TOKEN=你的Token

# 3. 验证登录
npx wrangler whoami
# 成功输出: "You are logged in with an User API Token."
```

#### 方式 B：浏览器 OAuth（可能不稳定）

```bash
npx wrangler login
# 会自动打开浏览器，授权后完成登录
# 如果 localhost 回调失败，改用方式 A
```

### 二、部署

```bash
npm run deploy
# 等同于: vite build && wrangler deploy
```

部署成功后输出：
```
Uploaded agnes-ai
Deployed agnes-ai triggers
  agnes.fanko.kdns.fr
  https://agnes-ai.3180806542.workers.dev
Current Version ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 三、验证部署

```bash
# 检查 Worker 状态
npx wrangler deployments

# 查看实时日志
npx wrangler tail
```

---

## ⚙️ 配置文件详解

### wrangler.jsonc（完整配置）

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "agnes-ai",
  "main": "worker/index.js",
  "compatibility_date": "2025-06-13",
  
  // 静态资源配置
  "assets": {
    "directory": "./dist",                           // Vite 构建输出目录
    "binding": "ASSETS",                             // Worker 中通过 env.ASSETS 访问
    "not_found_handling": "single-page-application", // SPA 路由 fallback 到 index.html
    "run_worker_first": ["/api/agnes/*"]             // API 请求优先交给 Worker 处理
  },
  
  // 自定义域名
  "routes": [
    {
      "pattern": "agnes.fanko.kdns.fr",
      "custom_domain": true                          // Cloudflare 自动管理 DNS + SSL
    }
  ]
}
```

### worker/index.js（核心逻辑）

```js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API 代理：/api/agnes/* → https://apihub.agnes-ai.com/*
    if (url.pathname.startsWith('/api/agnes/')) {
      return handleApiProxy(request, url);
    }

    // 静态资源：交给 Cloudflare Assets 服务
    return env.ASSETS.fetch(request);
  },
};

async function handleApiProxy(request, url) {
  const targetPath = url.pathname.replace(/^\/api\/agnes/, '');
  const targetUrl = `https://apihub.agnes-ai.com${targetPath}${url.search}`;

  const proxyRequest = new Request(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' 
      ? request.body 
      : undefined,
    redirect: 'follow',
  });

  try {
    const response = await fetch(proxyRequest);
    // 流式透传（支持 SSE）
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ 
        error: 'API 代理请求失败', 
        detail: String(err?.message || err) 
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

### 环境变量

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token | 部署时必须 |

> 💡 **推荐**：创建 `.env` 文件（已加入 `.gitignore`），写入 `CLOUDFLARE_API_TOKEN=你的Token`，wrangler 会自动读取。之后只需 `npm run deploy` 即可。

---

## 📦 可用脚本

| 命令 | 说明 |
|------|------|
| `npm install` | 安装依赖 |
| `npm run dev` | 启动 Vite 开发服务器 (localhost:5173) |
| `npm run build` | 构建生产版本到 `dist/` |
| `npm run deploy` | 构建 + 部署到 Cloudflare Workers |
| `npm run preview` | 本地预览生产构建 |

---

## 🌐 自定义域名

### 绑定方法

1. 域名必须已添加到 Cloudflare 账户（NS 指向 Cloudflare）
2. 在 `wrangler.jsonc` 的 `routes` 中添加：

```jsonc
"routes": [
  {
    "pattern": "你的域名",
    "custom_domain": true
  }
]
```

3. 重新部署：`npm run deploy`

### SSL 证书

`custom_domain: true` 模式下，Cloudflare 自动签发和管理 SSL 证书，无需手动操作。

### 域名要求

- ✅ 域名必须在 Cloudflare DNS 上管理
- ❌ 免费的第三方 DDNS 子域名（如 DuckDNS、No-IP）**不支持**
- 💡 如果没有自己的域名，可以使用免费的 `workers.dev` 子域名

---

## 🧹 实用命令

```bash
# 查看登录状态
npx wrangler whoami

# 查看部署历史和版本
npx wrangler deployments

# 实时查看 Worker 日志
npx wrangler tail

# 回滚到上一个版本
npx wrangler rollback

# 删除部署
npx wrangler delete

# 模拟部署（不实际部署）
npx wrangler deploy --dry-run
```

---

## 🔒 安全

- **API Token 不要提交到 Git！** 使用 `.env` 文件或系统环境变量
- Token 权限建议最小化：`workers_scripts:write` + `workers_routes:write`
- 用户 API Key 存储在浏览器 `localStorage`，不经过服务器
- 已 `.gitignore`：`.wrangler/` `dist/` `.env` `node_modules/`

---

## 🐛 故障排除

### Q: 部署报错 "Can't set compatibility date in the future"

修改 `wrangler.jsonc` 中的 `compatibility_date` 为当前或过去的日期，如 `"2025-06-13"`。

### Q: `wrangler login` 浏览器回调 localhost 打不开

改用 API Token 方式：
```bash
export CLOUDFLARE_API_TOKEN=你的Token
npx wrangler whoami  # 验证
```

### Q: Token 登录后仍然提示 "Not authenticated"

检查两点：
- **Shell 类型**：Windows bash 用 `export`，cmd 用 `set`
- **Token 格式**：确保 `cfut_` 开头的完整 Token，无多余空格

### Q: API 请求返回 502

```bash
# 查看 Worker 日志定位问题
npx wrangler tail

# 常见原因：
# 1. apihub.agnes-ai.com 暂时不可达
# 2. 请求 Header 问题
# 3. Worker 超时（默认 30s）
```

### Q: 部署成功但页面打不开

1. 检查自定义域名 DNS 是否已在 Cloudflare 生效：`nslookup agnes.fanko.kdns.fr`
2. 尝试用 workers.dev 地址访问验证
3. 检查 `npx wrangler tail` 是否有请求进入

### Q: 自定义域名显示 Cloudflare 错误页

确认：
- 域名已添加到 Cloudflare 账户
- `wrangler.jsonc` 中 `routes.pattern` 拼写完全正确
- 等待 DNS 传播（通常 1-5 分钟）

---

## 📊 数据持久化

所有用户数据存储在浏览器的 `localStorage` 中，无需后端数据库：

| Key | 内容 |
|-----|------|
| `agnes-base-url` | API 基础地址（默认 `/api/agnes`） |
| `agnes-api-key` | 用户的 Agnes AI API Key |
| `agnes-theme` | 主题偏好（dark / light） |
| `agnes-conversations` | 对话历史记录 |
| `agnes-images` | 图片生成记录 |
| `agnes-videos` | 视频生成记录 |

---

## 📝 变更记录

| 日期 | 变更 |
|------|------|
| 2026-06 | 从 Vercel 迁移到 Cloudflare Workers |
| 2026-06 | 绑定自定义域名 `agnes.fanko.kdns.fr` |
| 2026-06 | 添加 `DEPLOY.md` 部署文档 |
