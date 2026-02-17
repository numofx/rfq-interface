"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const errorDescription = searchParams.get("error_description");

    const finalize = async () => {
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
        router.replace("/?verified=1");
        return;
      }

      if (errorDescription) {
        router.replace(`/?verified=0&error=${encodeURIComponent(errorDescription)}`);
        return;
      }

      router.replace("/");
    };

    void finalize();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f3f4] text-[#15151b]">
      <p className="text-[14px] text-[#6f717b]">Finishing sign-in...</p>
    </div>
  );
}
