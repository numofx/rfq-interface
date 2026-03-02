import type { ReactNode } from "react";

interface AppBgProps {
  children: ReactNode;
  className?: string;
}

export function AppBg({ children, className }: AppBgProps) {
  return (
    <div className={`min-h-screen bg-bg text-text ${className ?? ""}`.trim()}>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: [
            "radial-gradient(70% 60% at 50% 45%, rgba(255,255,255,0.08), transparent 70%)",
            "radial-gradient(55% 45% at 50% 0%, hsl(var(--brand) / 0.2), transparent 75%)",
            "linear-gradient(180deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.68) 100%)",
          ].join(", "),
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
