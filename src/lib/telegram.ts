"use client";

import { useLaunchParams } from "@telegram-apps/sdk-react";

/**
 * Typing derived from launch params for whom this Mini App is running.
 * Used to keep the theme/canvas in sync with the Telegram client.
 */
export function useTmaContext() {
  const lp = useLaunchParams();
  return {
    platform: lp.platform,
    themeParams: lp.themeParams,
    startParam: lp.startParam,
    version: lp.version,
  };
}