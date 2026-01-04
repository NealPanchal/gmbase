"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { baseSepolia, base } from "wagmi/chains";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

export default function NetworkIndicator() {
  const { isConnected, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const [mounted, setMounted] = useState(false);

  // Determine target chain based on environment
  const targetChain = process.env.NEXT_PUBLIC_CHAIN_ID === '8453' ? base : baseSepolia;
  const targetChainId = targetChain.id;
  const targetChainName = targetChain.name;

  // Use the chain from the account
  const chainId = chain?.id;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isConnected && chainId) {
      console.log("[NetworkIndicator] Current chainId from wallet:", chainId);
      console.log("[NetworkIndicator] Is Base Sepolia?", chainId === baseSepolia.id);
    }
  }, [chainId, mounted, isConnected]);

  const getNetworkName = () => {
    if (!chainId) {
      return "Wrong Network ⚠️";
    }

    if (chainId === targetChainId) {
      return `${targetChainName} ✅`;
    } else if (chainId === baseSepolia.id) {
      return "Base Sepolia ⚠️";
    } else if (chainId === base.id) {
      return "Base Mainnet ⚠️";
    } else if (chainId === 1) {
      return "Ethereum Mainnet ⚠️";
    } else if (chainId === 11155111) {
      return "Sepolia ⚠️";
    } else {
      return "Wrong Network ⚠️";
    }
  };

  const isCorrectNetwork = chainId === targetChainId;

  const handleSwitchNetwork = async () => {
    if (!switchChainAsync) {
      toast.error("Please switch network manually in your wallet");
      return;
    }

    const switchToast = toast.loading(`Switching to ${targetChainName}...`);
    try {
      await switchChainAsync({ chainId: targetChainId });
      toast.success(`Switched to ${targetChainName}!`, { id: switchToast });
    } catch (err) {
      const error = err as Error;
      if (error.message?.includes("rejected")) {
        toast.error("Network switch cancelled", { id: switchToast });
      } else {
        toast.error("Failed to switch network", { id: switchToast });
      }
      console.error("Error switching:", err);
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted || !isConnected) return null;

  return (
    <div className="fixed top-20 right-4 z-50">
      <div
        className={`px-4 py-2 rounded-lg text-sm font-semibold ${
          isCorrectNetwork
            ? "bg-green-600 text-white"
            : "bg-red-600 text-white cursor-pointer hover:bg-red-700"
        }`}
        onClick={!isCorrectNetwork ? handleSwitchNetwork : undefined}
      >
        {getNetworkName()}
      </div>
    </div>
  );
}
