import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-plex-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "var(--font-plex-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        brand: {
          violet: "rgb(var(--brand-violet) / <alpha-value>)",
          green: "rgb(var(--brand-green) / <alpha-value>)",
          ochre: "rgb(var(--brand-ochre) / <alpha-value>)",
          bg: "rgb(var(--app-bg) / <alpha-value>)",
          bgSoft: "rgb(var(--app-bg-soft) / <alpha-value>)",
          surface: "rgb(var(--app-surface) / <alpha-value>)",
          surfaceRaised: "rgb(var(--app-surface-muted) / <alpha-value>)",
          border: "rgb(var(--app-border) / <alpha-value>)",
          textMuted: "rgb(var(--app-text-muted) / <alpha-value>)",
          dim: "rgb(var(--app-dim) / <alpha-value>)",
          success: "rgb(var(--app-success) / <alpha-value>)",
          warning: "rgb(var(--app-warning) / <alpha-value>)",
          danger: "rgb(var(--app-danger) / <alpha-value>)",
          info: "rgb(var(--app-info) / <alpha-value>)",
        },
      },
      boxShadow: {
        premium: "0 14px 28px rgba(15, 23, 42, 0.08)",
        "premium-dark": "0 14px 28px rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
