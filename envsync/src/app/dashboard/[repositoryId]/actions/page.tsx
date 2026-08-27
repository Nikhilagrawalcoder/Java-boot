import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/copy-button";
import { generateWorkflowYaml } from "@/lib/workflow";

export default function ActionsPage() {
  const yaml = generateWorkflowYaml();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">GitHub Actions check</h1>
        <p className="text-sm text-muted-foreground">
          Fail pull requests automatically when they introduce critical configuration issues.
          Save this as <code className="rounded bg-muted px-1 py-0.5">.github/workflows/envsync.yml</code>.
        </p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>envsync.yml</CardTitle>
          <CopyButton text={yaml} />
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs">
            <code>{yaml}</code>
          </pre>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        This runs <code className="rounded bg-muted px-1 py-0.5">envsync check</code> against the
        pull request's branch — it never needs access to your EnvSync account or real secret
        values, since the check only compares code usage against{" "}
        <code className="rounded bg-muted px-1 py-0.5">.env.example</code> and scans for likely
        exposed credentials.
      </p>
    </div>
  );
}
