"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from '@/lib/wagmi'
import { useState, type ReactNode } from 'react'
import { MiniKitProvider } from '@coinbase/onchainkit/minikit'
import { MiniAppProvider } from './providers/mini-app-provider'

/**
 * Wrapper for OnchainKit MiniKitProvider to fix React 18 type compatibility
 */
function MiniKitWrapper({ children }: { children: ReactNode }) {
  // Type assertion needed due to OnchainKit's React 19 type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Provider = MiniKitProvider as any;
  return (
    <Provider enabled autoConnect>
      {children}
    </Provider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MiniKitWrapper>
          <MiniAppProvider>
            {children}
          </MiniAppProvider>
        </MiniKitWrapper>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
