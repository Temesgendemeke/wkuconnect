import { createHmac, timingSafeEqual } from "crypto";

/**
 * Telegram Mini App authentication.
 *
 * `initData` is a raw query string of key=value pairs signed by Telegram using
 * the bot token. We re-derive the HMAC-SHA256 signature server side and compare
 * against the `hash` field using a timing-safe comparison. If the payload is
 * valid and fresh (older than MAX_AGE it is rejected to prevent replays), the
 * caller of this file can safely trust `user.id` as the Telegram user id.
 */

const MAX_AGE_SECONDS = 24 * 60 * 60; // 24h — Telegram initData is valid until expiry.

export class TelegramAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TelegramAuthError";
  }
}

type TelegramUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
};

type ParsedInitData<TParsedUser = TelegramUser> = {
  fields: Record<string, string>;
  hash: string;
  user?: TParsedUser;
};

/**
 * Parse an initData string into its fields and validate its signature.
 * Throws TelegramAuthError on any invalid input.
 */
export function parseAndVerifyInitData<TParsedUser extends TelegramUser = TelegramUser>(
  initData: string,
  botToken: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): ParsedInitData<TParsedUser> {
  if (!initData) {
    throw new TelegramAuthError("Missing Telegram initData");
  }
  if (!botToken) {
    throw new TelegramAuthError("TELEGRAM_BOT_TOKEN is not configured");
  }

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) {
    throw new TelegramAuthError("initData is missing its hash");
  }

  // Collect data-check-string fields (everything except `hash`).
  const fields: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    if (key !== "hash") {
      fields[key] = value;
    }
  }

  const dataCheckString = Object.entries(fields)
    .sort(([aKey], [bKey]) => aKey.localeCompare(bKey))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  // secret_key = HMAC_SHA256("WebAppData", <bot_token>)
  const secretKey = createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  // signature = HMAC_SHA256(secret_key, data_check_string)
  const signature = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest();

  const providedHash = Buffer.from(hash, "hex");
  if (
    providedHash.length !== signature.length ||
    !timingSafeEqual(providedHash, signature)
  ) {
    throw new TelegramAuthError("Telegram initData signature is invalid");
  }

  // Reject stale payloads to prevent replay attacks.
  const authDate = fields.auth_date ? Number(fields.auth_date) : 0;
  if (!authDate || nowSeconds - authDate > MAX_AGE_SECONDS) {
    throw new TelegramAuthError("Telegram initData has expired");
  }

  let user: TParsedUser | undefined;
  if (fields.user) {
    try {
      user = JSON.parse(fields.user) as TParsedUser;
    } catch {
      throw new TelegramAuthError("initData contains an invalid user object");
    }
    if (typeof user.id !== "number") {
      throw new TelegramAuthError("initData user has no valid id");
    }
  }

  return { fields, hash, user } as ParsedInitData<TParsedUser>;
}

export const BOT_TOKEN_ENV_KEY = "TELEGRAM_BOT_TOKEN";

export type { ParsedInitData, TelegramUser };
