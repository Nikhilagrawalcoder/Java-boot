import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function IssueDetailLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-7 w-1/2" />
      </div>
      <Card>
        <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-2 p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
