/**
 * Telegram Mini App authentication.
 *
 * `initData` is a raw query string of key=value pairs signed by Telegram using
 * the bot token. We re-derive the HMAC-SHA256 signature server side and verify
 * it with Web Crypto. If the payload is valid and fresh (older than MAX_AGE it
 * is rejected to prevent replays), the caller of this file can safely trust
 * `user.id` as the Telegram user id.
 */

const MAX_AGE_SECONDS = 24 * 60 * 60; // 24h — Telegram initData is valid until expiry.
const MAX_FUTURE_SKEW_SECONDS = 60;

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
export async function parseAndVerifyInitData<
  TParsedUser extends TelegramUser = TelegramUser,
>(
  initData: string,
  botToken: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<ParsedInitData<TParsedUser>> {
  if (!initData) {
    throw new TelegramAuthError("Missing Telegram initData");
  }
  if (!botToken) {
    throw new TelegramAuthError("TELEGRAM_BOT_TOKEN is not configured");
  }

  const params = new URLSearchParams(initData);
  const seenKeys = new Set<string>();
  for (const [key] of params) {
    if (seenKeys.has(key)) {
      throw new TelegramAuthError("initData contains duplicate fields");
    }
    seenKeys.add(key);
  }

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
    .sort(([aKey], [bKey]) => (aKey < bKey ? -1 : aKey > bKey ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  if (!/^[\da-f]{64}$/i.test(hash)) {
    throw new TelegramAuthError("Telegram initData signature is invalid");
  }

  const providedHash = new Uint8Array(32);
  for (let i = 0; i < providedHash.length; i++) {
    providedHash[i] = Number.parseInt(hash.slice(i * 2, i * 2 + 2), 16);
  }

  const encoder = new TextEncoder();

  // secret_key = HMAC_SHA256("WebAppData", <bot_token>)
  const webAppDataKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode("WebAppData"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const secretKey = await crypto.subtle.sign(
    "HMAC",
    webAppDataKey,
    encoder.encode(botToken),
  );

  // signature = HMAC_SHA256(secret_key, data_check_string)
  const signatureKey = await crypto.subtle.importKey(
    "raw",
    secretKey,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const isValid = await crypto.subtle.verify(
    "HMAC",
    signatureKey,
    providedHash,
    encoder.encode(dataCheckString),
  );

  if (!isValid) {
    throw new TelegramAuthError("Telegram initData signature is invalid");
  }

  const authDate = fields.auth_date ? Number(fields.auth_date) : 0;
  if (!Number.isSafeInteger(authDate) || authDate <= 0) {
    throw new TelegramAuthError("initData has an invalid auth_date");
  }
  if (authDate - nowSeconds > MAX_FUTURE_SKEW_SECONDS) {
    throw new TelegramAuthError("Telegram initData auth_date is in the future");
  }
  if (nowSeconds - authDate > MAX_AGE_SECONDS) {
    throw new TelegramAuthError("Telegram initData has expired");
  }

  if (!fields.user) {
    throw new TelegramAuthError("initData is missing its user");
  }

  let user: TParsedUser;
  try {
    user = JSON.parse(fields.user) as TParsedUser;
  } catch {
    throw new TelegramAuthError("initData contains an invalid user object");
  }
  if (
    !user ||
    typeof user !== "object" ||
    typeof user.id !== "number" ||
    !Number.isSafeInteger(user.id) ||
    user.id <= 0
  ) {
    throw new TelegramAuthError("initData user has no valid id");
  }

  return { fields, hash, user } as ParsedInitData<TParsedUser>;
}

export const BOT_TOKEN_ENV_KEY = "TELEGRAM_BOT_TOKEN";

export type { ParsedInitData, TelegramUser };
