"use client";

import { useAccount, useReadContract } from "wagmi";
import { hangmanAbi } from "@/lib/abi";
import { CONTRACT_ADDRESS } from "@/lib/wagmi";

export function PlayerStats() {
  const { address } = useAccount();

  const { data } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: hangmanAbi,
    functionName: "getPlayerStats",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const wins = data?.[0] ?? 0;
  const losses = data?.[1] ?? 0;
  const games = data?.[2] ?? 0;
  const score = data?.[3] ?? 0n;

  return (
    <div className="bg-[#141414] rounded-2xl border border-white/10 p-5 space-y-4">
      <h3 className="text-sm font-semibold tracking-wide text-white/50 uppercase">
        Your Stats
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <Stat label="Score" value={score.toString()} highlight />
        <Stat label="Wins" value={wins.toString()} />
        <Stat label="Losses" value={losses.toString()} />
        <Stat label="Games" value={games.toString()} />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-white/40 mb-0.5">{label}</p>
      <p
        className={`text-xl font-bold ${
          highlight ? "text-[#E84142]" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
