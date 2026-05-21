import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral";

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-green-500/10 text-green-400 border-green-500/20",
  error: "bg-red-500/10 text-red-400 border-red-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  neutral: "bg-neutral-700 text-neutral-400 border-neutral-600",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold border",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
