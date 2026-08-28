"use client";

import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { rescanAction } from "@/app/dashboard/[repositoryId]/actions";
import { cn } from "@/lib/utils";

export function RescanButton({ repositoryId }: { repositoryId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const promise = rescanAction(repositoryId);
      toast.promise(promise, {
        loading: "Scanning repository...",
        success: "Scan complete",
        error: (err) => (err instanceof Error ? err.message : "Scan failed"),
      });
      await promise.catch(() => {});
    });
  }

  return (
    <Button type="button" variant="outline" onClick={handleClick} disabled={isPending} className="gap-2">
      <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
      {isPending ? "Scanning..." : "Rescan"}
    </Button>
  );
}
