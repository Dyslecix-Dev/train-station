import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  variant?: "card" | "list" | "detail" | "chart";
  className?: string;
}

function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-lg border p-4", className)}>
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="mt-2 h-8 w-24" />
    </div>
  );
}

function ListSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-md border px-4 py-3">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
      </div>
    </div>
  );
}

function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-lg border p-4", className)}>
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="mt-2 h-48 w-full rounded-md" />
    </div>
  );
}

export function LoadingSkeleton({ variant = "card", className }: LoadingSkeletonProps) {
  if (variant === "list") return <ListSkeleton className={className} />;
  if (variant === "detail") return <DetailSkeleton className={className} />;
  if (variant === "chart") return <ChartSkeleton className={className} />;
  return <CardSkeleton className={className} />;
}
