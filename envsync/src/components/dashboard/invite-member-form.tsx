"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { inviteMemberAction } from "@/app/dashboard/settings/team-actions";

export function InviteMemberForm() {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    startTransition(() => {
      const promise = inviteMemberAction(email).then(() => setEmail(""));
      toast.promise(promise, {
        loading: "Adding member...",
        success: "Member added",
        error: (err) => (err instanceof Error ? err.message : "Something went wrong"),
      });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="teammate@company.com"
        className="flex-1 rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Adding..." : "Invite"}
      </Button>
    </form>
  );
}
