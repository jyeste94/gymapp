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
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))", soft: "hsl(var(--primary-soft))", cta: "hsl(var(--primary-cta))", pressed: "hsl(var(--primary-pressed))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        premium: { DEFAULT: "hsl(var(--premium))", foreground: "hsl(var(--premium-foreground))" },
        "recipe-hero": "hsl(var(--recipe-hero))",
        cream: "hsl(var(--cream))",
        disabled: "hsl(var(--disabled-fg))",
      },
      borderRadius: {
        card: "var(--radius-card)",
        tabbar: "var(--radius-tabbar)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        tab: "var(--shadow-tab)",
      },
    }
  },
  plugins: [],
} satisfies Config;
