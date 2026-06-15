import { cn } from "@/lib/utils";

type BadgeVariant = "sell" | "swap" | "new" | "like_new" | "good" | "fair" | "default";

const variants: Record<BadgeVariant, string> = {
  sell:     "bg-primary-container/20 text-primary border border-primary/20",
  swap:     "bg-secondary-container/20 text-secondary border border-secondary/20",
  new:      "bg-success-green/10 text-success-green border border-success-green/20",
  like_new: "bg-sky-blue/30 text-primary border border-sky-blue/50",
  good:     "bg-surface-container-high text-on-surface-variant border border-outline-variant/50",
  fair:     "bg-tertiary-container/20 text-tertiary border border-tertiary/20",
  default:  "bg-surface-container text-on-surface-variant border border-outline-variant/30",
};

const labels: Record<BadgeVariant, string> = {
  sell:     "Sell",
  swap:     "Swap",
  new:      "New",
  like_new: "Like New",
  good:     "Good",
  fair:     "Fair",
  default:  "",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full font-label-caps text-label-caps",
        variants[variant],
        className
      )}
    >
      {children ?? labels[variant]}
    </span>
  );
}

