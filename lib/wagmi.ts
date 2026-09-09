"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { avalancheFuji } from "wagmi/chains";
import { http } from "wagmi";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID || "YOUR_WALLETCONNECT_PROJECT_ID";

export const config = getDefaultConfig({
  appName: "Hangman Fuji",
  projectId,
  chains: [avalancheFuji],
  transports: {
    [avalancheFuji.id]: http(
      process.env.NEXT_PUBLIC_FUJI_RPC || "https://api.avax-test.network/ext/bc/C/rpc"
    ),
  },
  ssr: true,
});

export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;
