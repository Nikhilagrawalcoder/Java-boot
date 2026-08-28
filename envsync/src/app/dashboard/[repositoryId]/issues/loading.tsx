import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function IssuesLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-full max-w-md" />
      <Card>
        <CardContent className="space-y-3 p-5">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </CardContent>
      </Card>
    </div>
  );
}
