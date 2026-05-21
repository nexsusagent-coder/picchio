import { cn } from "@/lib/utils";

function SkeletonBase({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-neutral-800", className)}
    />
  );
}

export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase
          key={i}
          className={cn("h-4", i === lines - 1 && lines > 1 ? "w-3/4" : "w-full")}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("bg-neutral-800/50 rounded-2xl border border-neutral-700 p-6", className)}>
      <SkeletonBase className="h-5 w-1/3 mb-4" />
      <SkeletonBase className="h-10 w-1/2 mb-3" />
      <SkeletonBase className="h-3 w-2/3" />
    </div>
  );
}

export function SkeletonTableRow({ cols = 4, className }: { cols?: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 p-3", className)}>
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonBase
          key={i}
          className={cn("h-4", i === 0 ? "flex-1" : i === cols - 1 ? "w-16" : "w-24")}
        />
      ))}
    </div>
  );
}

export { SkeletonBase };
