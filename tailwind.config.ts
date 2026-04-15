import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./styles/**/*.{ts,tsx}"
  ],
  theme: {
    container: { center: true, padding: "2rem" },
    extend: {
      borderRadius: { "2xl": "1rem" },
      colors: {
        brand: {
          dark: "#141720",
          surface: "#1a1d27",
          border: "#252833",
          primary: "#4ade80",
          text: {
            main: "#e8eaf0",
            muted: "#6b7280",
          },
        },
      },
    }
  },
  plugins: []
} satisfies Config;
