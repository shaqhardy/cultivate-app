import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-stone/20 bg-black p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
