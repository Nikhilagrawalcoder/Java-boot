import type { Metadata } from "next";
import { BlogPostLayout } from "@/components/blog/blog-post-layout";

export const metadata: Metadata = { title: "Introducing EnvSync" };

export default function Post() {
  return (
    <BlogPostLayout title="Introducing EnvSync" date="August 28, 2026">
      <p>
        Most configuration bugs aren&apos;t caused by a bad value. They&apos;re caused by a
        missing one — a variable that exists in production, was never added to staging, and
        nobody notices until the feature that depends on it ships and fails. Not a compile
        error. Not a type error. A silent gap between what your code expects and what&apos;s
        actually configured, that only shows up at runtime, in whichever environment happens to
        be missing it.
      </p>

      <p>
        EnvSync is a scanner for that gap. It reads your source tree, finds every environment
        variable your code actually references, diffs that against{" "}
        <code>.env.example</code> and whatever&apos;s really deployed on Vercel, and turns the
        result into one number: a Configuration Health score, with every point traceable to a
        specific finding.
      </p>

      <h2>What it is not</h2>
      <p>
        It is not a secrets manager. It never reads, stores, or transmits a variable&apos;s
        value — only its name, and where that name is (or isn&apos;t) configured. If you already
        use Vault, Doppler, or Vercel&apos;s own environment variables to store secrets, EnvSync
        sits next to that, answering a question those tools don&apos;t: is everything that
        should be configured actually configured, everywhere it needs to be?
      </p>

      <h2>What&apos;s in this release</h2>
      <ul>
        <li>A repository scanner that detects environment variable usage across JS/TS, Python, and common config file formats.</li>
        <li><code>.env.example</code> diffing — flags variables your code reads that aren&apos;t documented, and documented variables nothing reads.</li>
        <li>Secret exposure detection — catches a hardcoded key that should have been a variable.</li>
        <li>A transparent Configuration Health score, with a visible breakdown of exactly what added or subtracted points.</li>
        <li>GitHub OAuth connect and a fully offline CLI (<code>npx envsync check</code>) for CI.</li>
      </ul>

      <p>
        Free for one repository, no credit card required. Everything above ships in every plan —
        paid tiers exist for more repositories and team seats, not a locked feature.
      </p>
    </BlogPostLayout>
  );
}
