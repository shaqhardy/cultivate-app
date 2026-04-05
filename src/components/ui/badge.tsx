import { cn } from "@/lib/utils";

type Variant = "default" | "free" | "paid";

const variantStyles: Record<Variant, string> = {
  default: "bg-stone/20 text-stone",
  free: "bg-cream/10 text-cream",
  paid: "bg-terracotta/15 text-terracotta",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
