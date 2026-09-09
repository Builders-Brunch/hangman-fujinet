"use client";

import { useReadContract } from "wagmi";
import { hangmanAbi } from "@/lib/abi";
import { CONTRACT_ADDRESS } from "@/lib/wagmi";

export function Leaderboard() {
  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: hangmanAbi,
    functionName: "getLeaderboard",
    query: { refetchInterval: 8000 },
  });

  const addresses = data?.[0] ?? [];
  const scores = data?.[1] ?? [];

  return (
    <div className="bg-[#141414] rounded-2xl border border-white/10 p-5 space-y-4">
      <h3 className="text-sm font-semibold tracking-wide text-white/50 uppercase">
        Leaderboard
      </h3>

      {isLoading && (
        <p className="text-sm text-white/40">Loading…</p>
      )}

      {!isLoading && addresses.length === 0 && (
        <p className="text-sm text-white/40">No scores yet. Be the first!</p>
      )}

      <ul className="space-y-2">
        {addresses.map((addr, i) => (
          <li
            key={addr}
            className="flex items-center justify-between text-sm py-1.5 border-b border-white/5 last:border-0"
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-5 text-center font-mono text-xs ${
                  i === 0 ? "text-[#E84142]" : "text-white/40"
                }`}
              >
                {i + 1}
              </span>
              <span className="font-mono text-white/80">
                {addr.slice(0, 6)}…{addr.slice(-4)}
              </span>
            </div>
            <span className="font-semibold tabular-nums">
              {scores[i]?.toString() ?? "0"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
