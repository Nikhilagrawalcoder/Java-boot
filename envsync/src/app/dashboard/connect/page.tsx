import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock, Globe } from "lucide-react";
import { auth } from "@/auth";
import { getPrimaryMembership } from "@/lib/org";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonClasses } from "@/components/ui/button";
import { GitHubIcon } from "@/components/icons";
import { ToastFromParam } from "@/components/toast-from-param";
import { cn } from "@/lib/utils";

const ERROR_MESSAGES: Record<string, string> = {
  not_configured:
    "GitHub OAuth isn't configured on this deployment yet — set GITHUB_ID and GITHUB_SECRET.",
  invalid_state: "That connection request expired or was invalid. Please try again.",
  token_exchange: "GitHub didn't return an access token. Please try again.",
  default: "Something went wrong connecting to GitHub.",
};

export default async function ConnectPage() {
  const session = await auth();
  const membership = await getPrimaryMembership(session!.user.id);

  if (membership?.organization.githubInstallations.length) {
    redirect("/dashboard/connect/repos");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-16 text-center">
      <ToastFromParam param="error" messages={ERROR_MESSAGES} />

      <h1 className="text-xl font-semibold tracking-tight">Connect GitHub</h1>
      <p className="mx-auto max-w-lg text-sm text-muted-foreground">
        Choose how much of GitHub EnvSync can see. Either way, it only ever scans the source of
        whichever repository you pick next — never write access, never your secret values. See{" "}
        <Link href="/docs/github-permissions" className="underline underline-offset-4">
          what's accessed and why
        </Link>
        .
      </p>

      <div className="grid gap-4 text-left sm:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Lock className="h-4 w-4" />
            </div>
            <CardTitle className="mt-2">All repositories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Requests GitHub's <code className="rounded bg-muted px-1 py-0.5">repo</code> scope —
              lets you pick from your private and public repositories. Most teams want this.
            </p>
            <a href="/api/github/connect?access=all" className="block">
              <span className={cn(buttonClasses("default", "default"), "w-full gap-2")}>
                <GitHubIcon className="h-4 w-4" />
                Authorize (private + public)
              </span>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Globe className="h-4 w-4" />
            </div>
            <CardTitle className="mt-2">Public repositories only</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Requests GitHub's narrower{" "}
              <code className="rounded bg-muted px-1 py-0.5">public_repo</code> scope — EnvSync
              never even sees your private repositories exist.
            </p>
            <a href="/api/github/connect?access=public" className="block">
              <span className={cn(buttonClasses("outline", "default"), "w-full gap-2")}>
                <GitHubIcon className="h-4 w-4" />
                Authorize (public only)
              </span>
            </a>
          </CardContent>
        </Card>
      </div>

      <div>
        <Link href="/dashboard" className="text-sm text-muted-foreground underline underline-offset-4">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
