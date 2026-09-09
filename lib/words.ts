// Simple word list for the workshop (lowercase only)
export const WORDS = [
  "avalanche",
  "blockchain",
  "solidity",
  "foundry",
  "wagmi",
  "viem",
  "subnet",
  "consensus",
  "validator",
  "developer",
  "workshop",
  "builders",
  "hangman",
  "contract",
  "frontend",
  "backend",
  "typescript",
  "javascript",
  "ethereum",
  "polygon",
  "optimism",
  "arbitrum",
  "layerzero",
  "defi",
  "nft",
  "token",
  "wallet",
  "metamask",
  "corewallet",
  "snowtrace",
  "testnet",
  "mainnet",
  "gasfee",
  "transaction",
  "leaderboard",
  "scoreboard",
  "victory",
  "challenge",
  "tournament",
  "community",
];

export function pickRandomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

export function letterToBit(letter: string): number {
  const code = letter.toLowerCase().charCodeAt(0) - 97; // a=0
  if (code < 0 || code > 25) return -1;
  return code;
}

export function isLetterGuessed(guessedMask: number, letter: string): boolean {
  const bit = letterToBit(letter);
  if (bit < 0) return false;
  return (guessedMask & (1 << bit)) !== 0;
}
