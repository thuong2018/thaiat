/**
 * ☯ Thái Ất Thần Kinh — Cloudflare Worker Proxy
 *
 * Cách deploy:
 * 1. Vào https://workers.cloudflare.com → tạo tài khoản miễn phí
 * 2. Tạo Worker mới → paste toàn bộ code này vào
 * 3. Vào Settings → Variables → thêm Secret:
 *      Tên: ANTHROPIC_API_KEY
 *      Giá trị: sk-ant-api03-xxxx... (API key của bạn)
 * 4. Deploy → copy URL worker (vd: https://thai-at.ten-ban.workers.dev)
 * 5. Trong index.html, thay PROXY_URL bằng URL đó
 */

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

// Chỉ cho phép domain GitHub Pages của bạn gọi vào
// Sửa lại thành domain thực của bạn, hoặc để "*" nếu muốn mở hoàn toàn
const ALLOWED_ORIGINS = [
  "https://TEN-GITHUB-CUA-BAN.github.io",   // ← sửa thành username GitHub của bạn
  "http://localhost",
  "http://127.0.0.1",
  "null", // file:// local
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    // Preflight OPTIONS
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // Chỉ nhận POST
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    // Kiểm tra API key đã được set chưa
    if (!env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: { message: "ANTHROPIC_API_KEY chưa được cấu hình trong Worker." } }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } }
      );
    }

    try {
      const body = await request.text();

      const upstreamResp = await fetch(ANTHROPIC_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body,
      });

      const data = await upstreamResp.text();

      return new Response(data, {
        status: upstreamResp.status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(origin),
        },
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: { message: "Worker lỗi: " + err.message } }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } }
      );
    }
  },
};
