/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6366f1", // Indigo 500
          foreground: "#ffffff",
        },
        background: {
          light: "#f8fafc", // Slate 50
          dark: "#020617", // Slate 950
        },
        card: {
          light: "#ffffff",
          dark: "#0f172a", // Slate 900
        }
      }
    },
  },
  plugins: [],
}
