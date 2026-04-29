import type { Config } from "tailwindcss";
const { default: flattenColorPalette } = require("tailwindcss/lib/util/flattenColorPalette");

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./styles/**/*.{ts,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', '"Inter"', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      borderRadius: { "3xl": "1.5rem", "4xl": "2rem", "5xl": "2.5rem" },
      colors: {
        apple: {
          "near-black": "#111827",
          gray: "#F3F4F6",
          blue: "#FBBF24",
          "link-blue": "#FBBF24",
          "link-dark": "#FBBF24",
          black: "#111827",
          surface: { "1": "#FFFFFF", "2": "#F3F4F6", "3": "#E5E7EB" },
          btn: { active: "#E5E7EB" },
        },
        fitia: {
          yellow: "#FBBF24",
          "yellow-dark": "#F59E0B",
          "yellow-light": "#FEF3C7",
          "yellow-bg": "#FFFBEB",
          "red": "#7F1D1D",
          "red-light": "#991B1B",
          bg: "#F3F4F6",
          card: "#FFFFFF",
          text: "#111827",
          "text-muted": "#6B7280",
          border: "#E5E7EB",
          "border-light": "#F3F4F6",
        },
      },
      boxShadow: {
        "card": "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
      },
    }
  },
  plugins: [addVariablesForColors]
} satisfies Config;

function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );
  addBase({ ":root": newVars });
}
