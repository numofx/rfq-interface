import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-panel/55 shadow-panel backdrop-blur-panel ring-1 ring-white/5",
        className
      )}
      {...props}
    />
  );
}
