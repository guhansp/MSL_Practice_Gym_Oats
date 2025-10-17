/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- DNATE Brand Colors ---
        primary: "#0375E9",          // Accent Blue
        indigo: "#18202D",           // Indigo Base
        graphite: "#505A69",         // Graphite Base
        grayLight: "#F6F7F7",        // Subtle Gray
        grayAccent: "#F5F7FB",       // Subtle Accent
        grayNeutral: "#EBEBEB",      // Obvious Gray
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],     // Default for UI, body, buttons
        serif: ["Domine", "serif"],          // Headlines / hero titles
        mono: ["Space Mono", "monospace"],   // Tech or metric labels
      },
    },
  },
  plugins: [],
}
