import { CopilotChat } from "./copilot-chat";

export default async function CopilotPage({
  params,
}: {
  params: Promise<{ repositoryId: string }>;
}) {
  const { repositoryId } = await params;
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">EnvSync Copilot</h1>
        <p className="text-sm text-muted-foreground">
          Ask about your configuration. Answers are generated only from your actual scan and
          environment data — no external AI call is made.
        </p>
      </div>
      <CopilotChat repositoryId={repositoryId} />
    </div>
  );
}
