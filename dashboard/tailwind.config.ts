import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  safelist: [
    // 平台徽章用动态色阶，避免被 Tailwind 摇掉
    {
      pattern:
        /(bg|text|border|ring)-(red|orange|amber|yellow|emerald|teal|cyan|sky|blue|indigo|pink|rose|slate)-(50|100|500|600|700|900)/,
    },
    {
      pattern:
        /dark:(bg|text|border|ring)-(red|orange|amber|yellow|emerald|teal|cyan|sky|blue|indigo|pink|rose|slate)-(900|800|400|300|200)/,
      variants: ["dark"],
    },
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
