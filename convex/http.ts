import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const MAX_BODY_BYTES = 64 * 1024;
const TELEGRAM_API_TIMEOUT_MS = 10_000;

type TelegramMessage = {
  chat: {
    id: number;
    type: string;
  };
  text?: string;
};

type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
};

function jsonResponse(body: object, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function secretMatches(provided: string | null, expected: string): boolean {
  if (!provided) {
    return false;
  }
  const maxLength = Math.max(provided.length, expected.length);
  let difference = provided.length ^ expected.length;
  for (let i = 0; i < maxLength; i++) {
    difference |=
      (provided.charCodeAt(i) || 0) ^ (expected.charCodeAt(i) || 0);
  }
  return difference === 0;
}

function isStartCommand(text: string): boolean {
  return /^\/start(?:@[A-Za-z0-9_]+)?(?:\s|$)/.test(text);
}

function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

function isTelegramUpdate(value: unknown): value is TelegramUpdate {
  if (
    !isRecord(value) ||
    typeof value.update_id !== "number" ||
    !Number.isSafeInteger(value.update_id) ||
    value.update_id < 0
  ) {
    return false;
  }
  if (value.message === undefined) {
    return true;
  }
  if (!isRecord(value.message) || !isRecord(value.message.chat)) {
    return false;
  }

  const { chat, text } = value.message;
  return (
    typeof chat.id === "number" &&
    Number.isSafeInteger(chat.id) &&
    typeof chat.type === "string" &&
    (text === undefined || typeof text === "string")
  );
}

const telegramWebhook = httpAction(async (ctx, request) => {
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const miniAppUrl = process.env.TELEGRAM_MINI_APP_URL;

  if (
    !webhookSecret ||
    !botToken ||
    !miniAppUrl ||
    !isHttpsUrl(miniAppUrl)
  ) {
    return jsonResponse({ error: "Webhook is not configured" }, 503);
  }
  if (
    !secretMatches(
      request.headers.get("X-Telegram-Bot-Api-Secret-Token"),
      webhookSecret,
    )
  ) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return jsonResponse({ error: "Request body too large" }, 413);
  }

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return jsonResponse({ error: "Request body too large" }, 413);
    }
    body = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: "Malformed JSON" }, 400);
  }

  if (!isTelegramUpdate(body)) {
    return jsonResponse({ error: "Malformed Telegram update" }, 400);
  }

  const message = body.message;
  if (
    !message ||
    message.chat.type !== "private" ||
    typeof message.text !== "string" ||
    !isStartCommand(message.text)
  ) {
    return jsonResponse({ ok: true }, 200);
  }

  const updateId = body.update_id;
  const claim = await ctx.runMutation(
    internal.telegramUpdates.claimTelegramUpdate,
    { updateId },
  );
  if (claim.status === "sent") {
    return jsonResponse({ ok: true, duplicate: true }, 200);
  }
  if (claim.status === "processing") {
    return jsonResponse({ error: "Update is being processed" }, 503);
  }

  const { processingAt } = claim;
  let delivered = false;
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: message.chat.id,
          text: "👋 Welcome to WKU Connect! Get started by opening the app below.",
          reply_markup: {
            inline_keyboard: [
              [{ text: "Open WKU Connect", web_app: { url: miniAppUrl } }],
            ],
          },
        }),
        signal: AbortSignal.timeout(TELEGRAM_API_TIMEOUT_MS),
      },
    );
    const result: unknown = await response.json().catch(() => null);
    delivered = response.ok && isRecord(result) && result.ok === true;
  } catch {
    delivered = false;
  }

  await ctx.runMutation(internal.telegramUpdates.finishTelegramUpdate, {
    updateId,
    processingAt,
    sent: delivered,
  });
  return delivered
    ? jsonResponse({ ok: true }, 200)
    : jsonResponse({ error: "Telegram message delivery failed" }, 502);
});

const http = httpRouter();
http.route({
  path: "/telegram/webhook",
  method: "POST",
  handler: telegramWebhook,
});

export default http;
