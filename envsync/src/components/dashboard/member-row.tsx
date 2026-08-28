"use client";

import { useTransition, type ChangeEvent } from "react";
import { toast } from "sonner";
import type { Role } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { removeMemberAction, changeMemberRoleAction } from "@/app/dashboard/settings/team-actions";

export function MemberRow({
  membershipId,
  name,
  email,
  role,
  isSelf,
  canRemove,
  canChangeRole,
}: {
  membershipId: string;
  name: string;
  email: string;
  role: Role;
  isSelf: boolean;
  canRemove: boolean;
  canChangeRole: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    if (!window.confirm(`Remove ${email} from this organization?`)) return;
    startTransition(() => {
      const promise = removeMemberAction(membershipId);
      toast.promise(promise, {
        loading: "Removing...",
        success: "Member removed",
        error: (err) => (err instanceof Error ? err.message : "Something went wrong"),
      });
    });
  }

  function handleRoleChange(e: ChangeEvent<HTMLSelectElement>) {
    const nextRole = e.target.value as Role;
    startTransition(() => {
      const promise = changeMemberRoleAction(membershipId, nextRole);
      toast.promise(promise, {
        loading: "Updating role...",
        success: "Role updated",
        error: (err) => (err instanceof Error ? err.message : "Something went wrong"),
      });
    });
  }

  return (
    <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {name}
          {isSelf ? " (you)" : ""}
        </p>
        <p className="truncate text-xs text-muted-foreground">{email}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {role === "OWNER" ? (
          <Badge variant="muted">Owner</Badge>
        ) : canChangeRole ? (
          <select
            value={role}
            onChange={handleRoleChange}
            disabled={isPending}
            className="rounded-md border border-border bg-transparent px-2 py-1 text-xs"
          >
            <option value="ADMIN">Admin</option>
            <option value="MEMBER">Member</option>
          </select>
        ) : (
          <Badge variant="muted">{role === "ADMIN" ? "Admin" : "Member"}</Badge>
        )}
        {role !== "OWNER" && !isSelf && canRemove && (
          <Button type="button" variant="destructive" size="sm" onClick={handleRemove} disabled={isPending}>
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
