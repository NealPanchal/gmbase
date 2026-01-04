"use client";

import { useEffect, useState } from "react";

interface StatsProps {
  yourGMs: number;
  gmsReceived: number;
  address?: `0x${string}`;
  isLoading?: boolean;
}

export default function Stats({ yourGMs, gmsReceived, address, isLoading }: StatsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-4">
      <div className="text-gray-300 text-2xl">
        Your GMs: <span className="text-white">{isLoading ? "..." : yourGMs}</span>
      </div>

      <div className="text-gray-300 text-2xl">
        GMs Received: <span className="text-white">{gmsReceived}</span>
      </div>

      {mounted && address && (
        <div className="flex items-center gap-2 mt-6">
          <div className="text-sm text-gray-400">
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
          <div className="text-green-400 text-sm">said GM</div>
        </div>
      )}
    </div>
  );
}
