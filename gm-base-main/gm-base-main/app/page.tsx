"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, usePublicClient } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { DAILY_GM_ADDRESS, DAILY_GM_ABI } from "@/lib/contract";
import GMModal from "@/components/GMModal";
import CountdownTimer from "@/components/CountdownTimer";
import Stats from "@/components/Stats";
import WalletConnect from "@/components/WalletConnect";
import NetworkIndicator from "@/components/NetworkIndicator";

// Add metadata for the page
export const metadata = {
  metadataBase: new URL('https://gm-base-git-main-officer-paynes-projects.vercel.app'),
  title: 'GM App',
  description: 'Send and receive GMs on Base',
  openGraph: {
    title: 'GM App',
    description: 'Send and receive GMs on Base',
    images: ['/og-image.jpg'],
  },
  other: {
    'base:app_id': '695a2d584d3a403912ed8c8e',
  },
};

// Determine target chain based on environment
const targetChain =
  process.env.NEXT_PUBLIC_CHAIN_ID === "8453" ? base : baseSepolia;

export default function Home() {
  const { address, isConnected } = useAccount();
  const [showModal, setShowModal] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [gmsReceived, setGmsReceived] = useState(0);
  const [mounted, setMounted] = useState(false);
  const publicClient = usePublicClient({ chainId: targetChain.id });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper function to fetch GMs via Alchemy API route
  async function fetchGMsViaAPI(address: string): Promise<number> {
    const response = await fetch(`/api/fetch-gms?address=${address}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "API request failed");
    }

    const data = await response.json();
    return data.count;
  }

  useEffect(() => {
    async function fetchGMsReceived() {
      if (!address) return;

      try {
        const count = await fetchGMsViaAPI(address);
        setGmsReceived(count);
        return;
      } catch {}

      if (!publicClient) return;

      try {
        const currentBlock = await publicClient.getBlockNumber();
        const contractDeploymentBlock = 18000000n;

        const cacheKey = `gms-received-${address.toLowerCase()}`;
        const cached = localStorage.getItem(cacheKey);
        const cachedData = cached ? JSON.parse(cached) : null;

        let fromBlock = contractDeploymentBlock;
        let currentCount = 0;

        if (cachedData?.lastBlock) {
          fromBlock = BigInt(cachedData.lastBlock) + 1n;
          currentCount = cachedData.count || 0;
        }

        if (fromBlock <= currentBlock) {
          const maxBlockRange = 100000n;
          let newLogs: any[] = [];

          while (fromBlock <= currentBlock) {
            const toBlock =
              fromBlock + maxBlockRange > currentBlock
                ? currentBlock
                : fromBlock + maxBlockRange;

            const logs = await publicClient.getLogs({
              address: DAILY_GM_ADDRESS,
              event: {
                type: "event",
                name: "GMSent",
                inputs: [
                  { type: "address", indexed: true, name: "sender" },
                  { type: "address", indexed: true, name: "recipient" },
                  { type: "uint256", indexed: false, name: "timestamp" },
                ],
              },
              args: { recipient: address },
              fromBlock,
              toBlock,
            });

            newLogs.push(...logs);
            fromBlock = toBlock + 1n;
            await new Promise((r) => setTimeout(r, 100));
          }

          const totalCount = currentCount + newLogs.length;
          setGmsReceived(totalCount);

          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              count: totalCount,
              lastBlock: currentBlock.toString(),
              timestamp: Date.now(),
            })
          );
        } else {
          setGmsReceived(currentCount);
        }
      } catch (error) {
        console.error("Error fetching GMs received:", error);
      }
    }

    fetchGMsReceived();
  }, [address, publicClient]);

  const { data: userStreak, isLoading: isLoadingStreak } = useReadContract({
    address: DAILY_GM_ADDRESS,
    abi: DAILY_GM_ABI,
    functionName: "streak",
    args: address ? [address] : undefined,
  });

  const { data: lastGMTimestamp } = useReadContract({
    address: DAILY_GM_ADDRESS,
    abi: DAILY_GM_ABI,
    functionName: "lastGM",
    args: address ? [address] : undefined,
  });

  const canGMToday = () => {
    if (!lastGMTimestamp) return true;
    const lastGMDay = Math.floor(Number(lastGMTimestamp) / 86400);
    const today = Math.floor(Date.now() / 86400000);
    return today > lastGMDay;
  };

  const handleTapToGM = () => {
    if (!isConnected) return alert("Please connect your wallet to GM!");
    canGMToday() ? setShowModal(true) : setShowCountdown(true);
  };

  return (

      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-900 to-indigo-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <WalletConnect />
        <NetworkIndicator />

        <div className="z-10 w-full max-w-md">
          <Stats
            yourGMs={Number(userStreak || 0)}
            gmsReceived={gmsReceived}
            address={address}
            isLoading={isLoadingStreak}
          />

          <div className="mt-12 flex justify-center">
            <button onClick={handleTapToGM} className="relative group">
              <div className="relative w-64 h-64 rounded-full bg-gradient-to-br from-cyan-600 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold">
                Tap to GM
              </div>
            </button>
          </div>
        </div>

        {showModal && <GMModal onClose={() => setShowModal(false)} address={address} />}
        {showCountdown && (
          <CountdownTimer
            lastGMTimestamp={Number(lastGMTimestamp)}
            onClose={() => setShowCountdown(false)}
          />
        )}
      </main>
    </>
  );
}
