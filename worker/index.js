/**
 * Cloudflare Worker - Agnes AI
 * 
 * Serves the Vue SPA from static assets (dist/) and proxies
 * /api/agnes/* requests to https://apihub.agnes-ai.com/*
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API 代理：将 /api/agnes/* 转发到 apihub.agnes-ai.com
    if (url.pathname.startsWith('/api/agnes/')) {
      return handleApiProxy(request, url);
    }

    // 其他请求交给静态资源处理（SPA fallback 由 wrangler.jsonc 配置）
    return env.ASSETS.fetch(request);
  },
};

/**
 * 代理 /api/agnes/* 请求到 apihub.agnes-ai.com
 * 例：/api/agnes/v1/chat/completions → https://apihub.agnes-ai.com/v1/chat/completions
 */
async function handleApiProxy(request, url) {
  // 去掉 /api/agnes 前缀，拼接到目标地址
  const targetPath = url.pathname.replace(/^\/api\/agnes/, '');
  const targetUrl = `https://apihub.agnes-ai.com${targetPath}${url.search}`;

  // 构建代理请求（保留原始 method、headers、body）
  const proxyRequest = new Request(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    redirect: 'follow',
  });

  try {
    const response = await fetch(proxyRequest);

    // 返回响应（流式传输，支持 SSE）
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'API 代理请求失败', detail: String(err?.message || err) }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
