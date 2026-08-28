import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <Skeleton className="h-12 w-12 rounded-full" />
      <Skeleton className="h-4 w-40" />
    </div>
  );
}
