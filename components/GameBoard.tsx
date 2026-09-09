"use client";

import { useState, useEffect, useCallback } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { keccak256, toBytes, toHex } from "viem";
import { hangmanAbi } from "@/lib/abi";
import { CONTRACT_ADDRESS } from "@/lib/wagmi";
import { pickRandomWord, isLetterGuessed } from "@/lib/words";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

type GameStatus = 0 | 1 | 2 | 3; // None, Active, Won, Lost

export function GameBoard() {
  const { address } = useAccount();
  const [secretWord, setSecretWord] = useState<string>("");
  const [localGuessed, setLocalGuessed] = useState<Set<string>>(new Set());
  const [statusMsg, setStatusMsg] = useState<string>("");

  // Read current on-chain game
  const { data: gameData, refetch: refetchGame } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: hangmanAbi,
    functionName: "getGame",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 4000 },
  });

  const status = (gameData?.[5] ?? 0) as GameStatus;
  const lives = gameData?.[3] ?? 6;
  const wordLength = gameData?.[1] ?? 0;
  const guessedMask = Number(gameData?.[2] ?? 0);

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isSuccess) {
      refetchGame();
      setStatusMsg("");
    }
  }, [isSuccess, refetchGame]);

  // Keep local guessed in sync with on-chain mask when possible
  useEffect(() => {
    if (status === 1 && guessedMask > 0) {
      const next = new Set<string>();
      for (const l of ALPHABET) {
        if (isLetterGuessed(guessedMask, l)) next.add(l);
      }
      setLocalGuessed(next);
    }
  }, [guessedMask, status]);

  const startNewGame = useCallback(() => {
    const word = pickRandomWord();
    setSecretWord(word);
    setLocalGuessed(new Set());
    setStatusMsg("Starting game…");

    const hash = keccak256(toBytes(word));
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: hangmanAbi,
      functionName: "startGame",
      args: [hash, word.length],
    });
  }, [writeContract]);

  const guess = useCallback(
    (letter: string) => {
      if (!secretWord || status !== 1 || localGuessed.has(letter) || isPending) return;

      const isCorrect = secretWord.includes(letter);
      const nextGuessed = new Set(localGuessed);
      nextGuessed.add(letter);
      setLocalGuessed(nextGuessed);

      // Check if this completes the word
      const revealed = secretWord
        .split("")
        .every((c) => nextGuessed.has(c) || c === letter);

      setStatusMsg(isCorrect ? `Correct: ${letter.toUpperCase()}` : `Wrong: ${letter.toUpperCase()}`);

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: hangmanAbi,
        functionName: "guessLetter",
        args: [
          toHex(letter.charCodeAt(0), { size: 1 }),
          isCorrect,
          0, // positions bitmask unused in this simplified version
          revealed ? secretWord : "",
        ],
      });
    },
    [secretWord, status, localGuessed, isPending, writeContract]
  );

  const claimWin = useCallback(() => {
    if (!secretWord) return;
    setStatusMsg("Claiming win…");
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: hangmanAbi,
      functionName: "claimWin",
      args: [secretWord],
    });
  }, [secretWord, writeContract]);

  // Display word with blanks
  const displayWord = () => {
    if (status === 0 || wordLength === 0) return null;
    const len = secretWord ? secretWord.length : wordLength;
    const chars = [];
    for (let i = 0; i < len; i++) {
      const letter = secretWord?.[i] ?? "";
      const shown =
        status === 2 || status === 3
          ? letter || "?"
          : letter && localGuessed.has(letter)
          ? letter
          : "_";
      chars.push(
        <span
          key={i}
          className="inline-block w-8 text-center text-2xl font-mono font-bold mx-0.5"
        >
          {shown.toUpperCase()}
        </span>
      );
    }
    return <div className="flex flex-wrap justify-center gap-1">{chars}</div>;
  };

  const busy = isPending || isConfirming;

  return (
    <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Game Board</h2>
        {status === 1 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/50">Lives</span>
            <span className="font-bold text-[#E84142]">{lives}</span>
          </div>
        )}
      </div>

      {/* Status messages */}
      {(status === 2 || status === 3 || statusMsg) && (
        <div
          className={`text-center py-3 rounded-lg text-sm font-medium ${
            status === 2
              ? "bg-green-500/20 text-green-400"
              : status === 3
              ? "bg-red-500/20 text-red-400"
              : "bg-white/5 text-white/70"
          }`}
        >
          {status === 2 && "You won! Score recorded on-chain."}
          {status === 3 && "Game over — out of lives."}
          {status === 1 && statusMsg}
        </div>
      )}

      {/* Word display */}
      <div className="min-h-[48px] flex items-center justify-center">
        {status === 0 && (
          <p className="text-white/40">Start a new game to begin</p>
        )}
        {(status === 1 || status === 2 || status === 3) && displayWord()}
      </div>

      {/* Keyboard */}
      {status === 1 && (
        <div className="grid grid-cols-9 gap-2">
          {ALPHABET.map((letter) => {
            const used = localGuessed.has(letter);
            const correct = secretWord.includes(letter) && used;
            return (
              <button
                key={letter}
                disabled={used || busy}
                onClick={() => guess(letter)}
                className={`
                  h-10 rounded-lg text-sm font-semibold uppercase transition
                  ${
                    used
                      ? correct
                        ? "bg-green-600/40 text-green-300 cursor-default"
                        : "bg-white/5 text-white/30 cursor-default"
                      : "bg-white/10 hover:bg-[#E84142] hover:text-white active:scale-95"
                  }
                  disabled:opacity-50
                `}
              >
                {letter}
              </button>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center pt-2">
        {(status === 0 || status === 2 || status === 3) && (
          <button
            onClick={startNewGame}
            disabled={busy}
            className="px-6 py-2.5 rounded-lg bg-[#E84142] hover:bg-[#c73637] font-semibold transition disabled:opacity-50"
          >
            {busy ? "Confirming…" : "Start New Game"}
          </button>
        )}
        {status === 1 &&
          secretWord &&
          secretWord.split("").every((c) => localGuessed.has(c)) && (
            <button
              onClick={claimWin}
              disabled={busy}
              className="px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 font-semibold transition disabled:opacity-50"
            >
              Claim Win
            </button>
          )}
      </div>

      {status === 1 && !secretWord && (
        <p className="text-center text-xs text-amber-400/80">
          Note: If you refreshed the page mid-game, the secret word is lost locally.
          Start a new game.
        </p>
      )}
    </div>
  );
}
