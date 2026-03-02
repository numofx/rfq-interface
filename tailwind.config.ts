import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "hsl(var(--bg))",
        panel: "hsl(var(--panel))",
        "panel-2": "hsl(var(--panel-2))",
        border: "hsl(var(--border))",
        text: "hsl(var(--text))",
        muted: "hsl(var(--muted))",
        brand: "hsl(var(--brand))",
        "brand-2": "hsl(var(--brand-2))",
      },
      borderRadius: {
        xl: "var(--radius)",
        "2xl": "var(--radius)",
      },
      boxShadow: {
        panel: "var(--shadow)",
      },
      backdropBlur: {
        panel: "var(--blur)",
      },
    },
  },
};

export default config;
