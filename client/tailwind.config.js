/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#16a34a",
        secondary: "#0369a1",
        accent: "#f59e0b",
      }
    },
  },
  plugins: [],
}
