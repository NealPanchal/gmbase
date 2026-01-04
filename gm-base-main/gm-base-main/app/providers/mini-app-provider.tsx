"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import sdk from "@farcaster/frame-sdk";

/**
 * Platform type for mini-app context
 */
export type Platform = "farcaster" | "base" | "browser";

/**
 * User context from mini-app SDKs
 */
export interface UserContext {
  fid?: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

/**
 * MiniApp context value interface
 */
export interface MiniAppContextValue {
  /** Whether running inside a mini-app (Farcaster or Base) */
  isInMiniApp: boolean;
  /** Current platform */
  platform: Platform;
  /** Whether SDK initialization is complete */
  isReady: boolean;
  /** User context from the platform (if available) */
  userContext: UserContext | null;
  /** Close the mini-app (Farcaster only) */
  close: () => Promise<void>;
  /** Open URL in appropriate context */
  openUrl: (url: string) => Promise<void>;
}

const MiniAppContext = createContext<MiniAppContextValue | null>(null);

interface MiniAppProviderProps {
  children: ReactNode;
}

export function MiniAppProvider({ children }: MiniAppProviderProps) {
  const [platform, setPlatform] = useState<Platform>("browser");
  const [isReady, setIsReady] = useState(false);
  const [userContext, setUserContext] = useState<UserContext | null>(null);

  // Initialize mini-app SDK (works for both Farcaster and Base)
  // Both platforms use @farcaster/miniapp-sdk under the hood
  const initMiniApp = useCallback(async (): Promise<boolean> => {
    try {
      // Get context from Farcaster/MiniApp SDK
      // This works for both Warpcast (Farcaster) and Base app contexts
      const context = await sdk.context;

      if (context) {
        // Determine platform based on client info
        // Base app uses clientFid 9152 (Coinbase Wallet), Warpcast uses different FIDs
        // For now, default to "farcaster" for any mini-app context
        const detectedPlatform: Platform = "farcaster";
        setPlatform(detectedPlatform);

        // Extract user context if available
        if (context.user) {
          setUserContext({
            fid: context.user.fid,
            username: context.user.username,
            displayName: context.user.displayName,
            pfpUrl: context.user.pfpUrl,
          });
        }

        // Dismiss splash screen
        await sdk.actions.ready();
        return true;
      }
    } catch (error) {
      // SDK not available or error - fall back to browser mode
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.debug("[MiniAppProvider] Mini-app SDK not available:", error);
      }
    }
    return false;
  }, []);

  // Browser fallback & initialization
  useEffect(() => {
    let mounted = true;

    async function init() {
      if (typeof window === "undefined") {
        return;
      }

      // Platform detection - try mini-app SDK
      const isMiniApp = await initMiniApp();
      if (isMiniApp && mounted) {
        setIsReady(true);
        return;
      }

      // Browser fallback
      if (mounted) {
        setPlatform("browser");
        setIsReady(true);

        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.debug("[MiniAppProvider] Running in browser mode (no mini-app context)");
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [initMiniApp]);

  // Action handlers
  const close = useCallback(async () => {
    if (platform === "farcaster") {
      try {
        await sdk.actions.close();
      } catch (error) {
        console.error("[MiniAppProvider] Failed to close:", error);
      }
    }
    // Base/browser: no-op (apps handle their own close)
  }, [platform]);

  const openUrl = useCallback(
    async (url: string) => {
      if (platform === "farcaster") {
        try {
          await sdk.actions.openUrl(url);
          return;
        } catch (error) {
          console.error("[MiniAppProvider] Farcaster openUrl failed:", error);
        }
      }
      // Fallback for Base and browser
      if (typeof window !== "undefined") {
        window.open(url, "_blank");
      }
    },
    [platform]
  );

  const value: MiniAppContextValue = {
    isInMiniApp: platform !== "browser",
    platform,
    isReady,
    userContext,
    close,
    openUrl,
  };

  return <MiniAppContext.Provider value={value}>{children}</MiniAppContext.Provider>;
}

/**
 * Hook to access MiniApp context
 * @throws Error if used outside MiniAppProvider
 */
export function useMiniApp(): MiniAppContextValue {
  const context = useContext(MiniAppContext);
  if (!context) {
    throw new Error("useMiniApp must be used within MiniAppProvider");
  }
  return context;
}
