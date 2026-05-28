import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          violet: "#8b5cf6",
          bg: "#070b16",
          surface: "#0f172a",
          border: "#1e293b",
          textMuted: "#94a3b8",
          success: "#16a34a",
          warning: "#f97316",
          danger: "#dc2626",
        },
      },
      boxShadow: {
        premium: "0 12px 30px rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
