"use client";

import { PrivyWagmiProvider } from "./privy-provider";
import { ErrorBoundary } from "./error-boundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient at the highest level to ensure it's available for all providers
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <PrivyWagmiProvider>{children}</PrivyWagmiProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
