"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useSwitchChain, useAccount, useEnsAddress } from "wagmi";
import { base, baseSepolia, mainnet } from "wagmi/chains";
import { toCoinType } from "viem/ens";
import { DAILY_GM_ADDRESS, DAILY_GM_ABI } from "@/lib/contract";
import toast from "react-hot-toast";

interface GMModalProps {
  onClose: () => void;
  address?: `0x${string}`;
}

export default function GMModal({ onClose }: GMModalProps) {
  const [friendAddress, setFriendAddress] = useState("");
  const [showFriendInput, setShowFriendInput] = useState(false);
  const { writeContract, isPending, isSuccess } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const { isConnected, chain } = useAccount();

  // Determine target chain based on environment
  const targetChain = process.env.NEXT_PUBLIC_CHAIN_ID === '8453' ? base : baseSepolia;
  const targetChainId = targetChain.id;
  const targetChainName = targetChain.name;

  // Use the actual wallet's chain ID, not the default from config
  const chainId = chain?.id;

  // Detect name type for ENS/Basename resolution
  const isBasename = friendAddress.endsWith('.base.eth');
  const isEnsName = friendAddress.includes('.') && !isBasename;

  // Resolve .eth names via Ethereum mainnet
  const { data: ensAddress, isLoading: ensLoading } = useEnsAddress({
    name: isEnsName ? friendAddress : undefined,
    chainId: mainnet.id,
  });

  // Resolve .base.eth names using ENSIP-19
  // NOTE: Basenames require resolution through mainnet with coinType parameter
  const { data: basenameAddress, isLoading: basenameLoading } = useEnsAddress({
    name: isBasename ? friendAddress : undefined,
    chainId: mainnet.id, // Must use mainnet, not base.id!
    coinType: toCoinType(base.id), // Converts Base chainId to ENSIP-11 coin type
  });

  const resolvedAddress = ensAddress || basenameAddress;
  const isResolving = ensLoading || basenameLoading;

  // Final address to use for transaction
  const finalAddress = resolvedAddress ||
    (friendAddress.startsWith('0x') && friendAddress.length === 42 ? friendAddress as `0x${string}` : null);

  // Show success toast and close modal when transaction succeeds
  useEffect(() => {
    if (isSuccess) {
      toast.success("GM sent successfully! 🎉");
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);
    }
  }, [isSuccess, onClose]);

  const handleGM = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    console.log("Current chainId:", chainId);
    console.log("Target chainId:", targetChainId);
    console.log("switchChainAsync available:", !!switchChainAsync);

    // Check if on correct network and switch if needed
    if (chainId !== targetChainId) {
      console.log("Wrong network detected, switching...");
      const switchToast = toast.loading(`Switching to ${targetChainName}...`);
      try {
        if (!switchChainAsync) {
          console.error("switchChainAsync not available");
          toast.error(`Please switch to ${targetChainName} network manually in your wallet`, { id: switchToast });
          return;
        }
        console.log("Calling switchChainAsync...");
        await switchChainAsync({ chainId: targetChainId });
        console.log("Network switched successfully");
        toast.success(`Switched to ${targetChainName}!`, { id: switchToast });
        // Wait a bit for the network to fully switch
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        const error = err as Error;
        console.error("Error switching chain:", err);
        if (error.message?.includes("User rejected") || error.message?.includes("rejected")) {
          toast.error("Network switch cancelled", { id: switchToast });
        } else {
          toast.error(`Failed to switch network: ${error.message}`, { id: switchToast });
        }
        return;
      }
    }

    try {
      writeContract({
        address: DAILY_GM_ADDRESS,
        abi: DAILY_GM_ABI,
        functionName: "gm",
      });
    } catch (err) {
      const error = err as Error;
      if (error.message?.includes("User rejected")) {
        toast.error("Transaction rejected");
      } else if (error.message?.includes("AlreadyGMToday")) {
        toast.error("You already GM'd today! Come back tomorrow");
      } else {
        toast.error("Failed to send GM. Please try again");
      }
      console.error("Error sending GM:", err);
    }
  };

  const handleGMToFriend = () => {
    setShowFriendInput(true);
  };

  const handleSendGMToFriend = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!friendAddress) {
      toast.error("Please enter a friend's address or ENS name");
      return;
    }

    // Check if still resolving
    if (isResolving) {
      toast.error("Still resolving name...");
      return;
    }

    // For names (.eth, .base.eth), check if resolved
    if (friendAddress.includes('.')) {
      if (!resolvedAddress) {
        toast.error("Could not resolve name. Please check and try again.");
        return;
      }
    } else {
      // Validate raw address format
      if (!friendAddress.startsWith("0x") || friendAddress.length !== 42) {
        toast.error("Invalid address format");
        return;
      }
    }

    if (!finalAddress) {
      toast.error("Invalid address");
      return;
    }

    console.log("Current chainId:", chainId);
    console.log("Target chainId:", targetChainId);

    // Check if on correct network and switch if needed
    if (chainId !== targetChainId) {
      console.log("Wrong network detected for friend GM, switching...");
      const switchToast = toast.loading(`Switching to ${targetChainName}...`);
      try {
        if (!switchChainAsync) {
          console.error("switchChainAsync not available");
          toast.error(`Please switch to ${targetChainName} network manually in your wallet`, { id: switchToast });
          return;
        }
        console.log("Calling switchChainAsync...");
        await switchChainAsync({ chainId: targetChainId });
        console.log("Network switched successfully");
        toast.success(`Switched to ${targetChainName}!`, { id: switchToast });
        // Wait a bit for the network to fully switch
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        const error = err as Error;
        console.error("Error switching chain:", err);
        if (error.message?.includes("User rejected") || error.message?.includes("rejected")) {
          toast.error("Network switch cancelled", { id: switchToast });
        } else {
          toast.error(`Failed to switch network: ${error.message}`, { id: switchToast });
        }
        return;
      }
    }

    try {
      writeContract({
        address: DAILY_GM_ADDRESS,
        abi: DAILY_GM_ABI,
        functionName: "gmTo",
        args: [finalAddress],
      });
    } catch (err) {
      const error = err as Error;
      if (error.message?.includes("User rejected")) {
        toast.error("Transaction rejected");
      } else if (error.message?.includes("AlreadyGMToday")) {
        toast.error("You already GM'd today! Come back tomorrow");
      } else if (error.message?.includes("InvalidRecipient")) {
        toast.error("Invalid recipient address");
      } else {
        toast.error("Failed to send GM. Please try again");
      }
      console.error("Error sending GM to friend:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-white text-4xl font-bold text-center mb-6">
          Choose GM Type
        </h2>

        {!showFriendInput ? (
          <div className="space-y-4">
            <button
              onClick={handleGM}
              disabled={isPending}
              className="w-full bg-gradient-to-r from-cyan-600 to-emerald-500 text-white py-6 rounded-2xl text-2xl font-bold hover:scale-105 transition-transform disabled:opacity-50"
            >
              {isPending ? "Sending..." : "GM"}
            </button>

            <button
              onClick={handleGMToFriend}
              className="w-full bg-gradient-to-r from-teal-400 to-cyan-600 text-white py-6 rounded-2xl text-2xl font-bold hover:scale-105 transition-transform"
            >
              GM to a Fren
            </button>

            <button
              onClick={onClose}
              className="w-full bg-gray-700 text-white py-6 rounded-2xl text-2xl font-bold hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="ENS, Basename, or address (0x...)"
              value={friendAddress}
              onChange={(e) => setFriendAddress(e.target.value)}
              className="w-full bg-indigo-900/50 text-white py-4 px-6 rounded-xl text-lg placeholder-teal-400"
            />

            {friendAddress.includes('.') && (
              <div className="text-sm text-teal-400 px-2">
                {isResolving && "Resolving..."}
                {!isResolving && resolvedAddress && (
                  <span className="text-green-400">
                    → {resolvedAddress.slice(0, 6)}...{resolvedAddress.slice(-4)}
                  </span>
                )}
                {!isResolving && !resolvedAddress && friendAddress.length > 3 && (
                  <span className="text-red-400">Name not found</span>
                )}
              </div>
            )}

            <button
              onClick={handleSendGMToFriend}
              disabled={isPending}
              className="w-full bg-gradient-to-r from-cyan-600 to-emerald-500 text-white py-6 rounded-2xl text-2xl font-bold hover:scale-105 transition-transform disabled:opacity-50"
            >
              {isPending ? "Sending..." : "Send GM"}
            </button>

            <button
              onClick={() => setShowFriendInput(false)}
              className="w-full bg-gray-700 text-white py-6 rounded-2xl text-2xl font-bold hover:bg-gray-600 transition-colors"
            >
              Back
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
