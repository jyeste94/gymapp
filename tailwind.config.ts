import type { Config } from "tailwindcss";
const { default: flattenColorPalette } = require("tailwindcss/lib/util/flattenColorPalette");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./styles/**/*.{ts,tsx}"
  ],
  darkMode: ["class"],
  theme: {
    container: { center: true, padding: "2rem" },
    extend: {
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      colors: {
        brand: {
          dark: "#0b0d12",
          surface: "#141720",
          "surface-light": "#1c1f2a",
          border: "#252833",
          primary: {
            DEFAULT: "#3ee07f",
            glow: "rgba(62, 224, 127, 0.45)",
          },
          secondary: "#10b981",
          accent: "#f472b6",
          text: {
            main: "#f8fafc",
            muted: "#94a3b8",
          },
        },
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #3ee07f 0%, #10b981 100%)",
        "gradient-glass": "linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%)",
        "glow-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        "glow-primary": "0 0 20px 0 rgba(62, 224, 127, 0.25)",
        "glass-inner": "inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        }
      }
    }
  },
  plugins: [addVariablesForColors]
} satisfies Config;

function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}
