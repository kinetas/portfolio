/**
 * Cloudflare Worker - OpenAI CORS proxy (minimal)
 *
 * 목적:
 * - GitHub Pages(정적)에서 브라우저가 OpenAI API를 직접 호출하면 CORS로 막힘
 * - Worker가 서버-서버로 OpenAI를 호출하고, 응답에 CORS 헤더를 붙여 브라우저에 전달
 *
 * 배포:
 * - Cloudflare Workers(무료 플랜 가능) 생성 후 이 파일 붙여넣기
 * - OpenAI 키는 Worker의 Secrets로 저장: OPENAI_API_KEY
 *
 * 프론트 설정:
 * - game.html에서 AI Endpoint를 Worker URL로 변경 (예: https://your-worker.your-subdomain.workers.dev/chat)
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    if (url.pathname !== "/chat") {
      return new Response("Not Found", { status: 404, headers: CORS_HEADERS });
    }
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: CORS_HEADERS });
    }

    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response("Worker secret OPENAI_API_KEY is not set.", { status: 500, headers: CORS_HEADERS });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response("Invalid JSON body.", { status: 400, headers: CORS_HEADERS });
    }

    // OpenAI chat.completions 포맷을 그대로 받아서 전달
    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { ...CORS_HEADERS, "Content-Type": upstream.headers.get("Content-Type") || "application/json" },
    });
  },
};

