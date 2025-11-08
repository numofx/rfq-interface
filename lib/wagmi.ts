import { http } from "wagmi";
import { celo, celoAlfajores } from "wagmi/chains";
import { createConfig } from "@privy-io/wagmi";

// Privy + wagmi configuration
// IMPORTANT: createConfig must be imported from @privy-io/wagmi, not from wagmi
// This ensures proper integration with Privy's embedded wallets

// Coerce chain objects to the expected `Chain` type using a narrow, explicit cast.
// This is stricter than `any` and documents the intent: the chain objects
// come from `wagmi/chains` but our pinned types may be slightly divergent.
// Coerce the array to the exact `chains` type expected by `createConfig` using
// the function's parameter types. This avoids importing an unavailable
// named `Chain` type and is stricter than `any` while still safe.
const chains = [celo, celoAlfajores] as unknown as Parameters<
  typeof createConfig
>[0]["chains"];

export const config = createConfig({
  chains,
  transports: {
    [celo.id]: http("https://forno.celo.org"),
    [celoAlfajores.id]: http("https://alfajores-forno.celo-testnet.org"),
  },
});
