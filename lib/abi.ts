export const hangmanAbi = [
  {
    type: "function",
    name: "startGame",
    inputs: [
      { name: "wordHash", type: "bytes32" },
      { name: "wordLength", type: "uint8" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "guessLetter",
    inputs: [
      { name: "letter", type: "bytes1" },
      { name: "isCorrect", type: "bool" },
      { name: "positionsBitmask", type: "uint32" },
      { name: "fullWord", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claimWin",
    inputs: [{ name: "fullWord", type: "string" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getGame",
    inputs: [{ name: "player", type: "address" }],
    outputs: [
      { name: "wordHash", type: "bytes32" },
      { name: "wordLength", type: "uint8" },
      { name: "guessed", type: "uint32" },
      { name: "lives", type: "uint8" },
      { name: "correctCount", type: "uint8" },
      { name: "status", type: "uint8" },
      { name: "startedAt", type: "uint64" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPlayerStats",
    inputs: [{ name: "player", type: "address" }],
    outputs: [
      { name: "wins", type: "uint32" },
      { name: "losses", type: "uint32" },
      { name: "gamesPlayed", type: "uint32" },
      { name: "totalScore", type: "uint256" },
      { name: "lastPlayed", type: "uint64" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLeaderboard",
    inputs: [],
    outputs: [
      { name: "", type: "address[]" },
      { name: "", type: "uint256[]" },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "GameStarted",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "wordHash", type: "bytes32", indexed: false },
      { name: "wordLength", type: "uint8", indexed: false },
    ],
  },
  {
    type: "event",
    name: "LetterGuessed",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "letter", type: "bytes1", indexed: false },
      { name: "correct", type: "bool", indexed: false },
      { name: "livesLeft", type: "uint8", indexed: false },
    ],
  },
  {
    type: "event",
    name: "GameWon",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "scoreEarned", type: "uint256", indexed: false },
      { name: "newTotalScore", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "GameLost",
    inputs: [{ name: "player", type: "address", indexed: true }],
  },
] as const;
