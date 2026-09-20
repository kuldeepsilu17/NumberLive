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
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Onyx / Obsidian Dark Spectrum
        dark: {
          950: "#09090B", // Deepest Onyx
          900: "#111113", // Main Dark Background
          850: "#18181B", // Dark Card Background
          800: "#222226", // Dark Surface / Elevated
          700: "#2E2E33", // Dark Border
          600: "#3F3F46", // Dark Subtle Border
          500: "#71717A", // Muted Dark Text
          400: "#A1A1AA", // Secondary Dark Text
          300: "#D4D4D8", // Light Dark Text
          200: "#E4E4E7", // Bright Text
          100: "#F4F4F5", // Off-white
        },
        // Champagne Gold Spectrum
        gold: {
          DEFAULT: "#C5A059", // Champagne Gold Primary
          50: "#FAF7F0",
          100: "#F3EDE0",
          200: "#E5D8BC",
          300: "#D5C095",
          400: "#C5A059", // Base Champagne Gold
          500: "#B88E3E", // Deep Gold
          600: "#9C762E", // Dark Metallic Gold
          700: "#7D5C22",
          800: "#5E4319",
          900: "#3D2B10",
          accent: "#DFBA73", // Lighter Gold Highlight
        },
        // Warm Ivory / Cream Light Spectrum
        ivory: {
          DEFAULT: "#FAF8F5", // Main Page Background
          50: "#FCFAF7",
          100: "#FAF8F5", // Base Ivory
          200: "#F4EFE6", // Light Card / Neutral Box
          300: "#EAE3D5", // Ivory Border
          400: "#D9CFBE", // Ivory Dark Border
          500: "#8C8275", // Muted Ivory Text
          600: "#5C5449", // Secondary Ivory Text
          900: "#1C1917", // Rich Charcoal
        },
        // Zinc compatibility alias mapped to ivory / dark
        zinc: {
          50: "#FAF8F5",
          100: "#F4EFE6",
          200: "#EAE3D5",
          300: "#D4D4D8",
          400: "#A1A1AA",
          500: "#71717A",
          600: "#52525B",
          700: "#2E2E33",
          800: "#222226",
          850: "#18181B",
          900: "#111113",
          950: "#09090B",
        },
        // Primary alias mapped to dark / gold
        primary: {
          DEFAULT: "#111113",
          hover: "#18181B",
          dark: "#09090B",
          light: "#FAF8F5",
        },
        // Semantic Indicators
        status: {
          live: "#16A34A",       // Crisp Green for Live Status
          liveBg: "#F0FDF4",
          liveBorder: "#BBF7D0",
          wait: "#71717A",       // Neutral Muted for Scheduled/Wait
          waitBg: "#F4EFE6",
          alert: "#DC2626",
          alertBg: "#FEF2F2",
        },
        success: {
          DEFAULT: "#16A34A",
          light: "#F0FDF4",
          border: "#BBF7D0",
          dark: "#14532D",
        },
        warning: {
          DEFAULT: "#C5A059",
          light: "#FAF7F0",
          border: "#E5D8BC",
        },
        error: {
          DEFAULT: "#DC2626",
          light: "#FEF2F2",
          border: "#FECACA",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        "result-huge": ["38px", { lineHeight: "1", fontWeight: "900", letterSpacing: "-0.03em" }],
        "result-lg": ["32px", { lineHeight: "1", fontWeight: "800", letterSpacing: "-0.02em" }],
        "result-md": ["24px", { lineHeight: "1", fontWeight: "800", letterSpacing: "-0.02em" }],
        "result-sm": ["18px", { lineHeight: "1", fontWeight: "700", letterSpacing: "-0.01em" }],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 4px 12px rgba(0, 0, 0, 0.08)",
        header: "0 1px 3px rgba(0, 0, 0, 0.18)",
        "gold-glow": "0 0 0 1px rgba(197, 160, 89, 0.35)",
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
        card: "8px",
        btn: "6px",
      },
    },
  },
  plugins: [],
};

export default config;
