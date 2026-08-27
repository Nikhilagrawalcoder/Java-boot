import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ConnectPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
      <h1 className="text-xl font-semibold tracking-tight">GitHub connection</h1>
      <p className="text-sm text-muted-foreground">
        Repository selection and scanning arrive in Phase 2. This screen will let you authorize
        the EnvSync GitHub App with read-only access and choose a repository to scan — EnvSync
        never requests write access or reads secret values.
      </p>
      <Link href="/dashboard">
        <Button variant="outline">Back to dashboard</Button>
      </Link>
    </div>
  );
}
