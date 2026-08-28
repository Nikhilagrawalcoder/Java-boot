"use client";

import { useActionState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { askCopilotAction, type CopilotState } from "./actions";

const initialState: CopilotState = { question: "", answer: null };

const SUGGESTIONS = [
  "Why is staging failing?",
  "Any issues with Stripe?",
  "Is the score improving?",
  "How do I fix it?",
];

export function CopilotChat({ repositoryId }: { repositoryId: string }) {
  const [state, formAction, pending] = useActionState(
    askCopilotAction.bind(null, repositoryId),
    initialState
  );
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <form action={formAction} className="flex gap-2">
        <input
          ref={inputRef}
          name="question"
          required
          placeholder="Why is staging failing?"
          className="flex-1 rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Thinking…" : "Ask"}
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.value = s;
                inputRef.current.focus();
              }
            }}
            className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>

      {state.answer && (
        <div className="space-y-1 rounded-md border border-border bg-muted/40 p-4 text-sm">
          <p className="text-xs text-muted-foreground">You asked: "{state.question}"</p>
          <p className="whitespace-pre-line">{state.answer}</p>
        </div>
      )}
    </div>
  );
}
