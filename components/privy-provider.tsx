"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/lib/wagmi";
import { celo } from "wagmi/chains";
import { useState } from "react";

export function PrivyWagmiProvider({ children }: { children: React.ReactNode }) {
  // Create QueryClient once per component instance, not on every render
  const [queryClient] = useState(() => new QueryClient());
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID as string;

  // Avoid initializing Privy with an invalid appId during build/prerender
  if (!appId) {
    if (typeof window !== "undefined") {
      console.error("NEXT_PUBLIC_PRIVY_APP_ID is not set. Please add it to your .env.local file.");
    }
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        // Appearance customization
        appearance: {
          theme: "light",
          accentColor: "#00D4AA",
          logo: "/numo-logo.png",
        },
        // Embedded wallets configuration
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
          requireUserPasswordOnCreate: false,
          showWalletUIs: false, // Hide default wallet UIs for white label experience
          noPromptOnSignature: true, // Don't show default UI for signatures and transactions
        },
        // Login methods
        // Note: To enable Google, configure it in Privy dashboard first
        loginMethods: ["email", "wallet"],
        // Default chain
        defaultChain: celo,
        // Supported chains
        supportedChains: [celo],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
