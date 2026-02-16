"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi";
import { celo } from "wagmi/chains";

export function PrivyWagmiProvider({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID as string;

  // Avoid initializing Privy with an invalid appId during build/prerender
  if (!appId) {
    if (typeof window !== "undefined") {
      console.error("NEXT_PUBLIC_PRIVY_APP_ID is not set. Please add it to your .env.local file.");
    }
    return <WagmiProvider config={config}>{children}</WagmiProvider>;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        // Appearance customization
        appearance: {
          theme: "light",
          accentColor: "#00D4AA",
          logo: "/numo.png",
        },
        // Embedded wallets configuration
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
          showWalletUIs: false, // Hide default wallet UIs for white label experience
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
      <WagmiProvider config={config}>{children}</WagmiProvider>
    </PrivyProvider>
  );
}
