import type { Metadata } from "next";
import { BlogPostLayout } from "@/components/blog/blog-post-layout";

export const metadata: Metadata = {
  title: "What actually breaks when a Stripe key is missing in staging",
};

export default function Post() {
  return (
    <BlogPostLayout
      title="What actually breaks when a Stripe key is missing in staging"
      date="August 29, 2026"
    >
      <p>
        It doesn&apos;t crash the app. That&apos;s what makes it slow to find. Most SDKs,
        Stripe&apos;s included, are perfectly happy to initialize with an empty string or{" "}
        <code>undefined</code> — the constructor doesn&apos;t validate the key, because it has no
        way to know it&apos;s wrong until it actually tries to talk to Stripe&apos;s API. Your
        app boots. The homepage loads. Everything looks fine, right up until someone hits
        checkout.
      </p>

      <h2>The first failure is a 500, not an error message</h2>
      <p>
        The checkout endpoint calls <code>stripe.paymentIntents.create()</code>, Stripe rejects
        the request with an authentication error, and that error propagates up as a 500 — because
        nothing in the code path was written to expect &quot;the key itself is missing&quot; as a
        distinct failure mode from &quot;Stripe is down&quot; or &quot;the card was
        declined.&quot; Whoever&apos;s looking at the error in staging sees a stack trace
        pointing at Stripe&apos;s SDK, not at the actual cause three layers up.
      </p>

      <h2>The second failure is silent</h2>
      <p>
        If the app also verifies Stripe webhooks — checking <code>STRIPE_WEBHOOK_SECRET</code>{" "}
        against the signature on incoming events — a missing secret doesn&apos;t throw at
        startup either. It just makes every webhook verification fail. In staging, where nobody&apos;s
        watching webhook delivery logs closely, that can run for weeks. Subscription-status
        updates stop landing, refund events stop syncing, and nobody notices until a QA pass
        specifically checks the thing that depends on it.
      </p>

      <h2>Why this specific case is common</h2>
      <p>
        Stripe keys are usually set once, early, by whoever first wired up payments — often
        directly in the platform&apos;s dashboard (Vercel, Railway, wherever), not through a file
        that gets copied when a new environment is provisioned. When a new staging environment
        gets spun up months later, it inherits the database URL and the auth secret because those
        get copied from a template. Payment keys, added later and out-of-band, don&apos;t make
        the cut.
      </p>

      <h2>What actually catches it</h2>
      <p>
        Not a runtime check inside the payment code — that only tells you after the request
        fails. What catches it earlier is comparing, before deploy, the full set of variables the
        code references against what&apos;s actually configured in that specific environment.
        EnvSync&apos;s environment comparison does exactly that: it reads what Vercel has
        configured for Production, Preview, and Development directly from Vercel&apos;s API, and
        flags <code>STRIPE_SECRET_KEY</code> or <code>STRIPE_WEBHOOK_SECRET</code> as missing in
        staging the moment it&apos;s missing — not the first time someone tries to check out.
      </p>
    </BlogPostLayout>
  );
}
