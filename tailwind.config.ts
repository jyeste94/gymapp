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
    extend: { borderRadius: { "2xl": "1rem" } }
  },
  plugins: []
} satisfies Config;
