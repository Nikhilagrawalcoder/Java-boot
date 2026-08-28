"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Reads a one-shot status from the URL (set by a server redirect, e.g. an
 * OAuth callback or API route) and surfaces it as a toast, then strips the
 * param so refreshing the page doesn't re-fire it.
 */
export function ToastFromParam({
  param,
  messages,
  type = "error",
}: {
  param: string;
  messages: Record<string, string>;
  type?: "error" | "success";
}) {
  const router = useRouter();
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;
    const url = new URL(window.location.href);
    const value = url.searchParams.get(param);
    if (!value) return;

    shown.current = true;
    const message = messages[value] ?? messages.default;
    if (message) {
      if (type === "error") toast.error(message);
      else toast.success(message);
    }

    url.searchParams.delete(param);
    router.replace(url.pathname + url.search, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
