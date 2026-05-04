/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#09090b', // Zinc 950
        surface: '#18181b', // Zinc 900
        primary: '#3b82f6', // Blue 500
        secondary: '#8b5cf6', // Violet 500
        accent: '#f472b6', // Pink 400
      }
    },
  },
  plugins: [],
}
