import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./styles/**/*.{ts,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', '"Inter"', 'sans-serif'],
      },
      colors: {
        border: "hsl(0 0% 92.5%)",
        background: "hsl(0 0% 96.9%)",
        foreground: "hsl(0 0% 2%)",
        muted: { DEFAULT: "hsl(0 0% 95%)", foreground: "hsl(0 0% 44%)" },
        card: { DEFAULT: "hsl(0 0% 100%)", foreground: "hsl(0 0% 2%)" },
        primary: { DEFAULT: "#FFC400", pressed: "#F4B400", cta: "#FFC928", soft: "#FFF4CF" },
        premium: "#661616",
        "recipe-hero": "#263B0C",
        cream: "#F7F4DF",
        disabled: "#BDBDBD",
        divider: "#ECECEC",
        apple: {
          "near-black": "#050505", gray: "#F7F7F7", blue: "#FFC400",
          "link-blue": "#FFC400", "link-dark": "#FFC400", black: "#050505",
          surface: { "1": "#FFFFFF", "2": "#F3F3F3", "3": "#E5E5E5" },
          btn: { active: "#E5E5E5" },
        },
      },
      boxShadow: {
        soft: "0 8px 24px rgba(0,0,0,0.06)",
        tab: "0 10px 30px rgba(0,0,0,0.08)",
      },
      borderRadius: {
        card: "1.25rem",
        tabbar: "1.875rem",
      },
    }
  },
  plugins: [],
} satisfies Config;
