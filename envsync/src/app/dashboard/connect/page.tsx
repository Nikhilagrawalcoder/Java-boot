import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPrimaryMembership } from "@/lib/org";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/icons";

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await auth();
  const membership = await getPrimaryMembership(session!.user.id);

  if (membership?.organization.githubInstallations.length) {
    redirect("/dashboard/connect/repos");
  }

  const errorMessages: Record<string, string> = {
    not_configured:
      "GitHub OAuth isn't configured on this deployment yet — set GITHUB_ID and GITHUB_SECRET.",
    invalid_state: "That connection request expired or was invalid. Please try again.",
    token_exchange: "GitHub didn't return an access token. Please try again.",
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 py-16 text-center">
      <h1 className="text-xl font-semibold tracking-tight">Connect GitHub</h1>
      <p className="text-sm text-muted-foreground">
        EnvSync requests read-only access to the repository you choose to scan its source for
        environment variable usage. It never requests write access, and it never reads or stores
        secret values. See{" "}
        <Link href="/dashboard/settings" className="underline underline-offset-4">
          what's accessed and why
        </Link>
        .
      </p>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {errorMessages[error] ?? "Something went wrong connecting to GitHub."}
        </p>
      )}

      <a href="/api/github/connect">
        <Button size="lg" className="gap-2">
          <GitHubIcon className="h-4 w-4" />
          Authorize GitHub
        </Button>
      </a>

      <div>
        <Link href="/dashboard" className="text-sm text-muted-foreground underline underline-offset-4">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
