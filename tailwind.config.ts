import type { Config } from "tailwindcss";

/**
 * "Ledger" — a financial operations console.
 * Single petrol-blue accent, graphite neutrals, semantic colors kept distinct
 * from brand. Flat surfaces, hairline borders, small radii. No gradients/glow.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#171A1F", // primary text
          body: "#3A404A", // secondary text
          muted: "#697280", // tertiary / captions
          faint: "#98A0AC",
        },
        rail: {
          DEFAULT: "#171A20", // sidebar ground
          soft: "#1E232C",
          line: "#2A3039",
        },
        // Petrol-blue brand accent (kept legacy keys mapped so nothing breaks)
        accent: {
          DEFAULT: "#134E7A",
          strong: "#0E3D61",
          bright: "#1B5E8C",
          dark: "#0E3D61",
          soft: "#E8EEF4",
          light: "#EEF3F8",
          line: "#CBD8E6",
          violet: "#1B5E8C", // legacy alias → stays in-hue, never purple
        },
        surface: {
          DEFAULT: "#FFFFFF",
          canvas: "#F4F5F6",
          muted: "#EFF1F3",
          border: "#E4E6EB",
        },
        navy: {
          DEFAULT: "#171A1F",
          light: "#3A404A",
          soft: "#EFF1F3",
        },
        status: {
          draft: "#8A919C",
          progress: "#134E7A",
          success: "#15803D",
          danger: "#B42318",
          warning: "#B45309",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        // Flat console: shadows are barely-there, borders do the work
        xs: "0 1px 1px rgba(23, 26, 31, 0.04)",
        card: "0 1px 2px rgba(23, 26, 31, 0.05)",
        elevated: "0 6px 20px -8px rgba(23, 26, 31, 0.20)",
        glow: "0 1px 2px rgba(23, 26, 31, 0.06)", // legacy alias → no colored glow
      },
      borderRadius: {
        DEFAULT: "0.375rem",
        md: "0.375rem",
        lg: "0.4375rem",
        xl: "0.5rem",
        "2xl": "0.625rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(3px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: {
        "fade-in": "fade-in 0.18s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
