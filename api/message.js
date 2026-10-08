// Vercel serverless function — forwards a portfolio contact message to Telegram.
//
// Required environment variables (set in the Vercel project, never in the repo):
//   TG_BOT_TOKEN  – Telegram bot token from @BotFather
//   TG_CHAT_ID    – destination chat id (your user id or a group id)
//
// Request:  POST /api/message  { "text": "...", "client": 12 }
// Response: { "ok": true }  or  { "ok": false, "error": "<code>" }

const MAX_LEN = 1000;

function send(res, status, payload) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(payload);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return send(res, 405, { ok: false, error: 'method_not_allowed' });
  }

  const token = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;
  if (!token || !chatId) {
    return send(res, 500, { ok: false, error: 'not_configured' });
  }

  // Soft same-origin guard so other sites can't relay spam through this endpoint.
  const origin = req.headers.origin;
  if (origin) {
    let sameOrigin = false;
    try {
      sameOrigin = new URL(origin).host === req.headers.host;
    } catch (_) {
      sameOrigin = false;
    }
    if (!sameOrigin) {
      return send(res, 403, { ok: false, error: 'forbidden_origin' });
    }
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (_) {
      body = null;
    }
  }
  if (!body || typeof body !== 'object') {
    return send(res, 400, { ok: false, error: 'bad_body' });
  }

  const text = typeof body.text === 'string' ? body.text.trim() : '';
  const client = Number.isFinite(Number(body.client)) ? Math.floor(Number(body.client)) : 0;

  if (!text) {
    return send(res, 400, { ok: false, error: 'empty' });
  }
  if (text.length > MAX_LEN) {
    return send(res, 413, { ok: false, error: 'too_long' });
  }

  const label = client > 0 ? `Client ${client}` : 'Client';

  try {
    const upstream = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `${label}: ${text}`,
        disable_web_page_preview: true,
      }),
    });
    const data = await upstream.json().catch(() => null);
    if (!upstream.ok || !data || data.ok !== true) {
      return send(res, 502, { ok: false, error: 'telegram_failed' });
    }
    return send(res, 200, { ok: true });
  } catch (_) {
    return send(res, 502, { ok: false, error: 'telegram_unreachable' });
  }
};