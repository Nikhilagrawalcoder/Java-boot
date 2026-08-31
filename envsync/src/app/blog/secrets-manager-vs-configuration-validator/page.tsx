import type { Metadata } from "next";
import { BlogPostLayout } from "@/components/blog/blog-post-layout";

export const metadata: Metadata = {
  title: "A secrets manager and a configuration validator are not the same tool",
};

export default function Post() {
  return (
    <BlogPostLayout
      title="A secrets manager and a configuration validator are not the same tool"
      date="August 29, 2026"
    >
      <p>
        &quot;Don&apos;t you already do this with Vault / Doppler / Vercel&apos;s built-in
        environment variables?&quot; comes up whenever EnvSync is described in one sentence, and
        the honest answer is: those tools solve a different problem than the one EnvSync solves.
        They&apos;re not competitors so much as adjacent layers that happen to share the word
        &quot;environment variable.&quot;
      </p>

      <h2>What a secrets manager actually does</h2>
      <p>
        Vault, Doppler, AWS Secrets Manager, and Vercel&apos;s own environment variable storage
        all answer the same question: <strong>where is this value stored, and who can read
        it?</strong> They handle encryption at rest, access control, rotation, and injecting the
        value into a running process. That&apos;s a real, necessary job — and EnvSync doesn&apos;t
        try to do it. EnvSync never reads, stores, or transmits a variable&apos;s value, full
        stop. It has no opinion on where your secrets live.
      </p>

      <h2>What none of them answer</h2>
      <p>
        Ask any secrets manager: &quot;does staging have every variable that production has, and
        does the code actually still use all of the variables that are set?&quot; There&apos;s no
        button for that. Secrets managers store what you tell them to store — they have no
        relationship to your source code, so they can&apos;t tell you a variable your code reads
        was never added, or that a variable sitting in the vault hasn&apos;t been referenced by
        code in six months and is dead weight (or worse, a stale credential nobody remembered to
        revoke).
      </p>

      <p>
        That comparison — code against configuration, environment against environment — is a
        static-analysis problem, not a storage problem. It needs to read your repository, not
        your secrets vault.
      </p>

      <h2>Where EnvSync actually sits</h2>
      <p>
        EnvSync scans source code for every environment variable reference, diffs that against{" "}
        <code>.env.example</code> and against what&apos;s live on your deploy platform (names
        only, via Vercel&apos;s API), and turns missing or unused variables into a ranked list of
        findings with a transparent health score. It sits <em>next to</em> whatever stores your
        actual secret values — Vault, Doppler, Vercel, a <code>.env</code> file nobody&apos;s
        proud of — and answers the question none of those tools are built to answer.
      </p>

      <p>
        If you&apos;re choosing one or the other: you&apos;re not choosing between EnvSync and a
        secrets manager. You still need somewhere to put the actual values. EnvSync is what tells
        you when that somewhere is missing one.
      </p>
    </BlogPostLayout>
  );
}
