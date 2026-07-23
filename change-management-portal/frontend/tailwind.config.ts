import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#b8d0ff",
          300: "#8bb0ff",
          400: "#5c88ff",
          500: "#3862f5",
          600: "#2544d6",
          700: "#1f37ac",
          800: "#1f318a",
          900: "#1e2d6e",
          950: "#141b3f",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
