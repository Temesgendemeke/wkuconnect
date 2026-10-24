import { ConvexReactClient } from "convex/react";

// create-next-app conventions allow relying on NEXT_PUBLIC_* env vars. When
// the project is not yet linked to Convex (`npx convex dev`), the URL is
// undefined: builds must still succeed, so we pass a placeholder. The client
// only attempts to connect from the browser when a query/subscription runs.
export const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://unconfigured.convex.cloud",
);