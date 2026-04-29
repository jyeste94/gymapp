import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./styles/**/*.{ts,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', '"Helvetica Neue"', 'sans-serif'],
      },
      colors: {
        fitia: {
          bg: "#F7F7F7",
          card: "#FFFFFF",
          text: "#050505",
          "text-muted": "#6F6F6F",
          "text-disabled": "#BDBDBD",
          yellow: "#FFC400",
          "yellow-cta": "#FFC928",
          "yellow-light": "#FFF4CF",
          divider: "#ECECEC",
          premium: "#661616",
          "recipe-green": "#263B0C",
        },
        apple: {
          "near-black": "#050505",
          gray: "#F7F7F7",
          blue: "#FFC400",
          "link-blue": "#FFC400",
          "link-dark": "#FFC400",
          black: "#050505",
          surface: { "1": "#FFFFFF", "2": "#F3F3F3", "3": "#E5E5E5" },
          btn: { active: "#E5E5E5" },
        },
      },
      boxShadow: {
        "card": "0 8px 24px rgba(0,0,0,0.06)",
        "nav": "0 -4px 20px rgba(0,0,0,0.06)",
      },
      borderRadius: {
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.5rem",
        "5xl": "2rem",
      },
    }
  },
  plugins: [],
} satisfies Config;
