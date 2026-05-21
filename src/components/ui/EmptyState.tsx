import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      <div className="text-neutral-600 mb-4">
        {icon || <Package size={48} className="opacity-40" />}
      </div>
      <h3 className="text-sm font-semibold text-neutral-400 mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-neutral-500 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
