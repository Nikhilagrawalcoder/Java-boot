import type { Metadata } from "next";
import { DocsPager } from "@/components/docs/docs-pager";

export const metadata: Metadata = { title: "GitHub permissions" };

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{children}</code>;
}

export default function DocsGitHubPermissionsPage() {
  return (
    <article className="max-w-2xl space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Guides</p>
        <h1 className="text-3xl font-semibold tracking-tight">What EnvSync accesses on GitHub, and why</h1>
        <p className="text-muted-foreground">
          EnvSync asks for the minimum access needed at each step — never more scope than the
          feature in front of you requires.
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">Signing in</h2>
        <p className="text-muted-foreground">
          Scope requested: <Code>read:user</Code>, <Code>user:email</Code>.
        </p>
        <p className="text-muted-foreground">
          This only identifies who you are — name, email, avatar — so EnvSync can create your
          account. It grants no access to any repository.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">Connecting a repository</h2>
        <p className="text-muted-foreground">
          When you choose to connect a repository, EnvSync requests read-only access to that
          repository&apos;s contents so it can scan source files for environment-variable usage (
          <Code>process.env.X</Code>, <Code>os.getenv(...)</Code>, and equivalents) and read{" "}
          <Code>.env.example</Code>. It does not request write access, and it does not read the
          contents of <Code>.env</Code>, <Code>.env.local</Code>, <Code>.env.staging</Code>, or any
          other file that&apos;s gitignored and never pushed to GitHub in the first place — those exist
          only on your machine or your deploy platform, which is exactly why EnvSync asks you to
          describe them via configuration metadata (which variables exist, whether they&apos;re set)
          instead of ever uploading them.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">What EnvSync never does</h2>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          <li>Never stores actual secret values.</li>
          <li>Never requests production secrets be uploaded.</li>
          <li>Never requests write access to your repository for scanning.</li>
          <li>Never automatically rotates or modifies credentials.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">Disconnecting</h2>
        <p className="text-muted-foreground">
          You can disconnect a repository and delete all of its scan data at any time from{" "}
          <Code>Settings → Repositories → Disconnect &amp; delete scan data</Code>. This removes
          every variable, issue, and score history entry EnvSync stored for that repository.
        </p>
      </section>

      <DocsPager currentHref="/docs/github-permissions" />
    </article>
  );
}
