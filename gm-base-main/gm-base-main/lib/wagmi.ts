import { http, createConfig } from 'wagmi'
import { base, baseSepolia, mainnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// Determine if production based on NEXT_PUBLIC_CHAIN_ID
const isProduction = process.env.NEXT_PUBLIC_CHAIN_ID === '8453';

// Use Base Mainnet for production, Base Sepolia for development
// Include mainnet for ENS resolution
const chains = isProduction
  ? [base, baseSepolia, mainnet] as const
  : [baseSepolia, base, mainnet] as const;

export const config = createConfig({
  chains,
  connectors: [
    injected(),
  ],
  transports: {
    [baseSepolia.id]: http(),
    [base.id]: http(),
    [mainnet.id]: http(), // For ENS resolution
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
