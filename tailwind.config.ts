import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1F2937",
          light: "#3D4451",
          soft: "#E9ECF1",
        },
        accent: {
          DEFAULT: "#2E5AAC",
          light: "#EAF0FB",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F5F6F8",
          border: "#E3E6EA",
        },
        status: {
          draft: "#8A919C",
          progress: "#2E5AAC",
          success: "#1E8E5A",
          danger: "#C0392B",
          warning: "#B8860B",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Inter",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.08)",
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
};

export default config;
