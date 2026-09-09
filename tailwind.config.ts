import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        avalanche: {
          DEFAULT: "#E84142",
          dark: "#B02A2B",
        },
      },
    },
  },
  plugins: [],
};
export default config;
