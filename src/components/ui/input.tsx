import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-cream mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-lg border border-stone/30 bg-black px-4 py-3 text-cream placeholder:text-stone/50 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
