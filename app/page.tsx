"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { GameBoard } from "@/components/GameBoard";
import { Leaderboard } from "@/components/Leaderboard";
import { PlayerStats } from "@/components/PlayerStats";

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest text-[#E84142] uppercase">
              Team1 Builders Brunch
            </p>
            <h1 className="text-xl font-bold tracking-tight">
              Hangman on Avalanche Fuji
            </h1>
          </div>
          <ConnectButton showBalance={false} chainStatus="icon" />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        {!isConnected ? (
          <div className="text-center py-20 space-y-6">
            <h2 className="text-3xl font-bold">Connect your wallet to play</h2>
            <p className="text-white/60 max-w-md mx-auto">
              Switch to Avalanche Fuji testnet, get free AVAX from the faucet,
              and start a game. Scores are recorded on-chain.
            </p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
            <div className="pt-8 text-sm text-white/40 space-y-1">
              <p>
                Fuji faucet:{" "}
                <a
                  href="https://core.app/tools/testnet-faucet"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#E84142] underline"
                >
                  core.app/tools/testnet-faucet
                </a>
              </p>
              <p>Chain ID: 43113</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <GameBoard />
              </div>
              <div className="space-y-6">
                <PlayerStats />
                <Leaderboard />
              </div>
            </div>
          </>
        )}
      </div>

      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-white/40">
          Built for Team1 Builders Brunch · Avalanche Fuji · Next.js + Solidity + Foundry
        </div>
      </footer>
    </main>
  );
}
