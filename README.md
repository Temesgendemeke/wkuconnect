This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Telegram `/start` webhook

Convex serves the Telegram webhook at `POST /telegram/webhook`. In a private
chat, `/start` replies with a welcome message and an Open WKU Connect Mini App
button. Configure `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, and
`TELEGRAM_MINI_APP_URL` as Convex environment variables; the Mini App URL must
use HTTPS. Keep the bot token and webhook secret server-side.

After deploying the Convex functions, register the endpoint with Telegram's
`setWebhook` method using the Convex Site URL plus `/telegram/webhook`, the same
secret, and `allowed_updates` set to `["message"]`. The endpoint stores
processed `/start` update IDs to suppress duplicate responses on Telegram
retries. As Telegram's `sendMessage` API has no idempotency key, a successful
send followed by a lost response can still result in a duplicate after a retry.

When a user opens the Mini App, the frontend sends Telegram's raw `initData` to
`users.upsertUser`. Convex verifies its Telegram signature and uses the signed
Telegram user ID and display name to find or create the user's account. Phone
fields may remain on existing database records, but they are not required for
authentication or access to app features.
