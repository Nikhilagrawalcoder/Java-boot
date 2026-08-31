import type { Metadata } from "next";
import { BlogPostLayout } from "@/components/blog/blog-post-layout";

export const metadata: Metadata = { title: "Why .env.example always lies" };

export default function Post() {
  return (
    <BlogPostLayout title="Why .env.example always lies" date="August 30, 2026">
      <p>
        <code>.env.example</code> exists to answer one question for a new teammate or a fresh
        deploy: what does this app need to run? It&apos;s a list of names, usually with no
        values, checked into git so it stays with the code it describes. In theory, it&apos;s
        always accurate — it&apos;s right there in the repo, next to the code that reads it.
      </p>

      <p>
        In practice, it drifts within the first sprint. Someone adds a feature that reads{" "}
        <code>process.env.RESEND_API_KEY</code>, tests it locally with a value already sitting in
        their shell, ships the PR, and never touches <code>.env.example</code> — there&apos;s no
        error to catch, no test that fails, nothing in the review that flags it. The file still
        looks complete. It just isn&apos;t.
      </p>

      <h2>The gap is invisible until it isn&apos;t</h2>
      <p>
        Nothing breaks yet. Local development still works, because the developer who added the
        variable has it set. CI might still pass, if the test suite doesn&apos;t exercise that
        code path. The gap surfaces exactly once: when someone else — a new hire, a second
        developer, a staging environment nobody&apos;s touched in a month — tries to run the app
        without already knowing about a variable that was never written down.
      </p>

      <p>
        By then it&apos;s not a documentation problem, it&apos;s a debugging session. The error
        message is usually generic — <code>undefined is not a function</code>,{" "}
        <code>ECONNREFUSED</code>, a third-party SDK throwing something unhelpful — because most
        code doesn&apos;t validate its own environment variables before using them. Finding the
        actual cause means grepping the codebase for <code>process.env</code> and comparing it
        against whatever&apos;s actually set, by hand.
      </p>

      <h2>The file can&apos;t verify itself</h2>
      <p>
        This isn&apos;t a discipline problem you fix by asking people to remember. A file&apos;s
        job is to be read; it has no way to check whether it&apos;s still true against a codebase
        that keeps changing underneath it. Something outside the file has to do that comparison —
        scan what the code actually references, diff it against what&apos;s documented, and
        surface the difference before it reaches someone without the context to debug it fast.
      </p>

      <p>
        That comparison is the first thing EnvSync does on every scan: every variable the code
        references, against every variable <code>.env.example</code> documents, in both
        directions — undocumented variables and documented-but-unused ones both show up as
        findings, not as something you find out about later.
      </p>
    </BlogPostLayout>
  );
}
