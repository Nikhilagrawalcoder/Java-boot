"use client";

import { useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import type { IssueStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { setIssueStatusAction } from "@/app/dashboard/[repositoryId]/issues/actions";

export function IssueStatusAction({
  repositoryId,
  issueId,
  status,
}: {
  repositoryId: string;
  issueId: string;
  status: IssueStatus;
}) {
  const [isPending, startTransition] = useTransition();

  if (status === "RESOLVED") {
    return <span className="shrink-0 text-xs text-muted-foreground">Resolved</span>;
  }

  const isIgnored = status === "IGNORED";
  const next: IssueStatus = isIgnored ? "OPEN" : "IGNORED";

  function handleClick() {
    startTransition(() => {
      const promise = setIssueStatusAction(repositoryId, issueId, next);
      toast.promise(promise, {
        loading: isIgnored ? "Reopening..." : "Ignoring...",
        success: isIgnored ? "Issue reopened" : "Issue ignored",
        error: "Something went wrong",
      });
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className="shrink-0 gap-1.5"
    >
      {isIgnored ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
      {isIgnored ? "Reopen" : "Ignore"}
    </Button>
  );
}
