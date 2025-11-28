/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors
        primary: {
          DEFAULT: "#0F4C3A",
          dark: "#073327",
          light: "#E8F3EF",
        },
        // Gold Accent
        gold: {
          DEFAULT: "#D4A941",
          light: "#F5E6C3",
        },
        // Status Colors
        status: {
          active: "#38A169",
          expiring: "#ECC94B",
          expired: "#E53E3E",
        },
        // Neutral Colors
        brand: {
          white: "#FAFAF7",
          charcoal: "#2E2E2E",
          mint: "#E8F3EF",
        }
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
}
