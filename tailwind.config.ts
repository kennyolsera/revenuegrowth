import type { Config } from "tailwindcss";

/**
 * "Aurora" — bright, premium product-SaaS (Linear/Stripe-grade craft).
 * Petrol→azure brand gradient used with restraint, graphite neutrals, soft
 * layered shadows (never colored glow), generous radii. Semantic color stays
 * distinct from brand. See design-system memory.
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
          DEFAULT: "#1657A0", // petrol-azure, a touch brighter for the SaaS feel
          strong: "#0F4680",
          bright: "#2E7BD6", // gradient end / highlights
          azure: "#2E7BD6",
          dark: "#0F4680",
          soft: "#E9F1FA",
          light: "#F0F6FC",
          line: "#C7DBEF",
          violet: "#2E7BD6", // legacy alias → azure, never purple
        },
        cyan: {
          data: "#0EA5C9", // secondary data-viz pop
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
        // Soft, layered depth (Stripe-grade) — never a colored glow
        xs: "0 1px 2px rgba(16, 24, 40, 0.05)",
        card: "0 1px 2px rgba(16, 24, 40, 0.05), 0 1px 3px rgba(16, 24, 40, 0.06)",
        elevated: "0 4px 8px -2px rgba(16, 24, 40, 0.08), 0 12px 28px -8px rgba(16, 24, 40, 0.14)",
        lift: "0 2px 6px -2px rgba(16, 24, 40, 0.08), 0 8px 20px -6px rgba(16, 24, 40, 0.12)",
        glow: "0 1px 2px rgba(16, 24, 40, 0.06)", // legacy alias → no colored glow
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #1657A0 0%, #2E7BD6 100%)",
        "brand-sheen": "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 60%)",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        md: "0.5rem",
        lg: "0.625rem",
        xl: "0.75rem",
        "2xl": "1rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(3px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        "draw-line": { from: { strokeDashoffset: "1" }, to: { strokeDashoffset: "0" } },
      },
      animation: {
        "fade-in": "fade-in 0.18s ease-out forwards",
        "fade-up": "fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
