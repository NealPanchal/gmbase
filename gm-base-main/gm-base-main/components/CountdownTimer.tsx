"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  lastGMTimestamp: number;
  onClose: () => void;
}

export default function CountdownTimer({ lastGMTimestamp, onClose }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const lastGMDate = new Date(lastGMTimestamp * 1000);

      // Calculate next UTC midnight
      const nextMidnight = new Date(lastGMDate);
      nextMidnight.setUTCHours(24, 0, 0, 0);

      const nextMidnightTimestamp = Math.floor(nextMidnight.getTime() / 1000);
      const secondsLeft = nextMidnightTimestamp - now;

      if (secondsLeft <= 0) {
        onClose();
        return;
      }

      const hours = Math.floor(secondsLeft / 3600);
      const minutes = Math.floor((secondsLeft % 3600) / 60);
      const seconds = secondsLeft % 60;

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [lastGMTimestamp, onClose]);

  const formatTime = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
        <h2 className="text-white text-3xl font-bold mb-4">
          Already GM&apos;d Today! 🎉
        </h2>

        <div className="text-gray-300 text-xl mb-6">
          Time to next reset:
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <div className="bg-indigo-900/50 rounded-xl p-4 min-w-[80px]">
            <div className="text-white text-4xl font-bold">{formatTime(timeLeft.hours)}</div>
            <div className="text-teal-400 text-sm">Hours</div>
          </div>
          <div className="bg-indigo-900/50 rounded-xl p-4 min-w-[80px]">
            <div className="text-white text-4xl font-bold">{formatTime(timeLeft.minutes)}</div>
            <div className="text-teal-400 text-sm">Minutes</div>
          </div>
          <div className="bg-indigo-900/50 rounded-xl p-4 min-w-[80px]">
            <div className="text-white text-4xl font-bold">{formatTime(timeLeft.seconds)}</div>
            <div className="text-teal-400 text-sm">Seconds</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gray-700 text-white py-4 rounded-2xl text-xl font-bold hover:bg-gray-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
