"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { requestContactComplete } from "@telegram-apps/sdk-react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";

export function PhoneRegistration({ initData }: { initData: string }) {
  const verifyPhone = useMutation(api.users.verifyPhone);
  const [requestingContact, setRequestingContact] = useState(false);
  const [requestMessage, setRequestMessage] = useState<string | null>(null);

  async function sharePhoneNumber() {
    setRequestMessage(null);
    if (!requestContactComplete.isAvailable()) {
      setRequestMessage(
        "Phone sharing is not supported in this Telegram client. Please open WKU Connect in an up-to-date Telegram app.",
      );
      return;
    }

    setRequestingContact(true);
    try {
      const response = await requestContactComplete({ timeout: 60_000 });
      await verifyPhone({ initData, rawContact: response.raw });
      setRequestMessage("Your phone number has been verified.");
    } catch (error) {
      if (error instanceof Error && error.name === "AccessDeniedError") {
        setRequestMessage(
          "Phone sharing was cancelled. You can try again whenever you are ready.",
        );
      } else if (error instanceof Error && error.name === "TimeoutError") {
        setRequestMessage("The contact request timed out. Please try again.");
      } else {
        setRequestMessage(
          error instanceof Error
            ? error.message
            : "Phone verification failed. Please try again.",
        );
      }
    } finally {
      setRequestingContact(false);
    }
  }

  return (
    <div className="mt-4 flex max-w-sm flex-col items-center gap-2 text-center">
      <p className="text-sm font-medium">Verify your phone number</p>
      <p className="text-xs text-zinc-500">
        Share your Telegram phone number to continue. It will remain private
        and will not appear on your profile. This verifies phone ownership, not
        WKU enrollment.
      </p>
      <Button
        type="button"
        disabled={requestingContact}
        onClick={sharePhoneNumber}
      >
        {requestingContact ? "Waiting for Telegram…" : "Share phone number"}
      </Button>
      {requestMessage && (
        <p className="text-xs text-zinc-600" role="status">
          {requestMessage}
        </p>
      )}
    </div>
  );
}
