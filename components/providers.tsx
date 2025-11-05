"use client";

import { PrivyWagmiProvider } from "./privy-provider";
import { ErrorBoundary } from "./error-boundary";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <PrivyWagmiProvider>{children}</PrivyWagmiProvider>
    </ErrorBoundary>
  );
}
