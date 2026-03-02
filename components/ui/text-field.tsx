import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const TextField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-xl border border-border/70 bg-panel-2/50 px-4 text-sm text-text placeholder:text-muted/60 outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/20",
          className
        )}
        {...props}
      />
    );
  }
);

TextField.displayName = "TextField";
