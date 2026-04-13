/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef4fb",
          100: "#d9e7f5",
          200: "#b9d1ec",
          300: "#89b3de",
          400: "#6a97cc",
          500: "#4A90D9",
          600: "#3b77bd",
          700: "#31619c",
          800: "#2b5081",
          900: "#26436b",
        },
        secondary: {
          50: "#fef8ed",
          100: "#fcefd3",
          200: "#f7d9a3",
          300: "#f3c16d",
          400: "#f1ae47",
          500: "#F5A623",
          600: "#e08a15",
          700: "#ba6b13",
          800: "#965417",
          900: "#7b4517",
        },
        accent: {
          50: "#f3faf0",
          100: "#e3f4d9",
          200: "#c9e8b6",
          300: "#a4d689",
          400: "#88c162",
          500: "#7ED321",
          600: "#67b11a",
          700: "#518c19",
          800: "#427019",
          900: "#395c1a",
        },
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
