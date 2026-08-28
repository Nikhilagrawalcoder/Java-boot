"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";

export function DestructiveActionButton({
  action,
  confirmMessage,
  loadingMessage,
  successMessage,
  children,
  ...props
}: {
  action: () => Promise<void>;
  confirmMessage: string;
  loadingMessage: string;
  successMessage: string;
  children: React.ReactNode;
} & Omit<ButtonProps, "onClick" | "children">) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    startTransition(() => {
      const promise = action();
      toast.promise(promise, {
        loading: loadingMessage,
        success: successMessage,
        error: (err) => (err instanceof Error ? err.message : "Something went wrong"),
      });
    });
  }

  return (
    <Button type="button" variant="destructive" onClick={handleClick} disabled={isPending} {...props}>
      {isPending ? "Working..." : children}
    </Button>
  );
}
