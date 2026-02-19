"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ForwardInterface } from "@/components/forms/swap";
import { AppLayout, CardWrapper, ContentLayout } from "@/components/layout/page-shell";
import { supabase } from "@/lib/supabase/client";

export default function AppPage() {
  const router = useRouter();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [accountEmail, setAccountEmail] = useState("");

  useEffect(() => {
    if (!supabase) return;
    let isMounted = true;

    supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (!isMounted || error || !data.user) return;
        const user = data.user;
        const metadata = user.user_metadata as Record<string, unknown> | undefined;
        const first = typeof metadata?.first_name === "string" ? metadata.first_name.trim() : "";
        const last = typeof metadata?.last_name === "string" ? metadata.last_name.trim() : "";
        const fullName = [first, last].filter(Boolean).join(" ");
        const fallbackName = typeof metadata?.name === "string" ? metadata.name.trim() : "";

        setAccountName(fullName || fallbackName || "User");
        setAccountEmail(user.email ?? "No email available");
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    setIsAccountMenuOpen(false);
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/");
  };

  const headerRight = (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsAccountMenuOpen((prev) => !prev)}
        className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#e9e9ec] text-[#15151b] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] hover:bg-[#e2e2e6]"
        aria-label="Open account menu"
        aria-expanded={isAccountMenuOpen}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-[20px] w-[20px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="8" r="4.2" />
          <path d="M4.5 20c1.6-3.1 4.4-4.8 7.5-4.8s5.9 1.7 7.5 4.8" />
        </svg>
      </button>

      {isAccountMenuOpen ? (
        <div className="absolute right-0 z-30 mt-2 w-[240px] rounded-[16px] border border-[#d9d9de] bg-[#f2f2f4] p-4 shadow-[0_16px_30px_rgba(0,0,0,0.12)]">
          <p className="text-[15px] leading-none font-semibold text-[#15151b]">{accountEmail}</p>
          <p className="mt-1.5 text-[13px] font-medium text-[#7b7d88]">{accountName}</p>

          <div className="mt-3 border-t border-[#d7d8de] pt-3">
            <button
              type="button"
              onClick={handleLogout}
              className="text-[14px] font-semibold text-[#c4362c] hover:text-[#ab2e25]"
            >
              Log out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <AppLayout headerRight={headerRight}>
      <ContentLayout variant="rfq">
        <CardWrapper size="ticket">
          <ForwardInterface />
        </CardWrapper>
      </ContentLayout>
    </AppLayout>
  );
}
