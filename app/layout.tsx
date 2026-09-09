import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import "@rainbow-me/rainbowkit/styles.css";

export const metadata: Metadata = {
  title: "Hangman on Avalanche Fuji | Team1 Builders Brunch",
  description: "Play Hangman on Avalanche Fuji testnet — built for Team1 Builders Brunch",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
