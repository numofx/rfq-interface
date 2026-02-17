import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const containerClass = "mx-auto w-full max-w-[1200px] px-6";

const headerHeightClass = "h-16";

interface AppLayoutProps {
  children: React.ReactNode;
  headerCenter?: React.ReactNode;
  headerRight?: React.ReactNode;
  logoLink?: string;
  className?: string;
}

export function AppLayout({
  children,
  headerCenter,
  headerRight,
  logoLink = "/",
  className,
}: AppLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-[#f3f3f4] text-[#15151b]", className)}>
      <header className={headerHeightClass}>
        <div className={cn(containerClass, "relative flex h-full items-center")}>
          <Link href={logoLink} className="shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative -mr-6 h-[31px] w-[114px]">
                <Image src="/numo.png" alt="Numo" fill className="object-contain object-left" priority />
              </div>
              <div className="ml-0.5 mr-1 h-6 w-px bg-[#d6d7dd]" />
              <p className="text-[20px] leading-none font-semibold tracking-[-0.02em] text-[#18233a]">FX Options</p>
            </div>
          </Link>

          {headerCenter ? (
            <div className="pointer-events-none absolute left-1/2 -translate-x-1/2">
              <div className="pointer-events-auto">{headerCenter}</div>
            </div>
          ) : null}

          {headerRight ? <div className="ml-auto">{headerRight}</div> : null}
        </div>
      </header>

      {children}
    </div>
  );
}

type ContentVariant = "default" | "rfq" | "auth";

interface ContentLayoutProps {
  children: React.ReactNode;
  variant?: ContentVariant;
  className?: string;
}

const contentVariantClass: Record<ContentVariant, string> = {
  default: "pt-6 pb-12",
  rfq: "flex justify-center pt-6 pb-10",
  auth: "flex items-center justify-center pt-2 pb-12",
};

export function ContentLayout({ children, variant = "default", className }: ContentLayoutProps) {
  return (
    <main
      className={cn(
        containerClass,
        "min-h-[calc(100vh-4rem)]",
        contentVariantClass[variant],
        className
      )}
    >
      {children}
    </main>
  );
}

type CardSize = "ticket" | "auth";

interface CardWrapperProps {
  children: React.ReactNode;
  size?: CardSize;
  className?: string;
}

const cardWidthClass: Record<CardSize, string> = {
  ticket: "max-w-[460px]",
  auth: "max-w-[420px]",
};

export function CardWrapper({ children, size = "ticket", className }: CardWrapperProps) {
  return <section className={cn("w-full", cardWidthClass[size], className)}>{children}</section>;
}
