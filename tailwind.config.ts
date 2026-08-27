import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1E293B",
          light: "#334155",
          soft: "#E9ECF1",
        },
        // Electric Cobalt brand ramp — indigo core with a violet lean
        accent: {
          DEFAULT: "#4F46E5",
          light: "#EEF0FF",
          soft: "#E0E7FF",
          bright: "#6366F1",
          dark: "#4338CA",
          violet: "#7C3AED",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          canvas: "#F7F8FC",
          muted: "#F1F3F9",
          border: "#E5E8F0",
        },
        status: {
          draft: "#8A919C",
          progress: "#4F46E5",
          success: "#0F9D6B",
          danger: "#DC2626",
          warning: "#D97706",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        xs: "0 1px 2px rgba(15, 23, 42, 0.05)",
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px -4px rgba(15, 23, 42, 0.06)",
        elevated: "0 8px 30px -8px rgba(30, 41, 59, 0.16)",
        glow: "0 0 0 1px rgba(79, 70, 229, 0.12), 0 8px 24px -6px rgba(79, 70, 229, 0.35)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
