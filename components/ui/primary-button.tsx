import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function PrimaryButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "h-11 w-full rounded-xl bg-white text-black font-medium hover:bg-white/95 active:bg-white/90 disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
