import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HealthGauge } from "@/components/health-gauge";
import { EnvironmentCard } from "@/components/environment-card";
import { FindingItem } from "@/components/finding-item";
import { demoRepository } from "@/lib/demo-data";

export function DashboardPreview() {
  const demo = demoRepository;

  return (
    <Card className="w-full max-w-2xl overflow-hidden text-left shadow-xl">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{demo.name}</span>
          <Badge variant="muted">demo</Badge>
        </div>
        <span className="text-xs text-muted-foreground">Last scan: {demo.lastScan}</span>
      </div>

      <CardContent className="grid gap-6 pt-5 sm:grid-cols-[auto_1fr]">
        <div className="space-y-3">
          <CardTitle>Configuration Health</CardTitle>
          <HealthGauge score={demo.healthScore} />
          <div className="space-y-1 pt-1 text-xs text-muted-foreground">
            <p>🔴 {demo.critical} critical issues</p>
            <p>🟡 {demo.warning} warnings</p>
            <p>🟢 {demo.healthy} healthy variables</p>
          </div>
        </div>

        <div className="space-y-2">
          {demo.environments.map((env) => (
            <EnvironmentCard key={env.name} {...env} />
          ))}
        </div>
      </CardContent>

      <CardHeader className="border-t border-border pt-4">
        <CardTitle>Recent findings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {demo.findings.map((f) => (
          <FindingItem key={f.text} severity={f.severity}>
            {f.text}
          </FindingItem>
        ))}
      </CardContent>
    </Card>
  );
}
