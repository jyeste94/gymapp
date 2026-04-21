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
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        "pill": "980px",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      colors: {
        apple: {
          blue: "#0071e3",
          "link-blue": "#0066cc",
          "link-dark": "#2997ff",
          black: "#000000",
          gray: "#f5f5f7",
          "near-black": "#1d1d1f",
          surface: {
            "1": "#272729",
            "2": "#262628",
            "3": "#28282a",
            "4": "#2a2a2d",
            "5": "#242426"
          },
          text: {
            white: "#ffffff",
            "near-black": "#1d1d1f",
            "black-80": "rgba(0, 0, 0, 0.8)",
            "black-48": "rgba(0, 0, 0, 0.48)"
          },
          btn: {
            "active": "#ededf2",
            "default-light": "#fafafc",
            "overlay": "rgba(210, 210, 215, 0.64)",
            "dark-hover": "rgba(255, 255, 255, 0.32)"
          }
        },
        // Legacy fallbacks mapped temporarily during transition, we will migrate everything.
        brand: {
          dark: "#f5f5f7",
          surface: "#ffffff",
          border: "rgba(0, 0, 0, 0.1)",
          primary: {
            DEFAULT: "#0071e3",
            glow: "rgba(0, 113, 227, 0.4)",
          },
          secondary: "#0066cc",
          text: {
            main: "#1d1d1f",
            muted: "rgba(0, 0, 0, 0.48)",
          },
        },
      },
      boxShadow: {
        "apple-card": "rgba(0, 0, 0, 0.22) 3px 5px 30px 0px",
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

  addBase({
    ":root": newVars,
  });
}
