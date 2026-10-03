/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#B91C1C",
        primaryDark: "#991B1B",
        white: "#FFFFFF",
        black: "#171717",
        text: "#262626",
        muted: "#737373",
        border: "#E5E5E5",
        background: "#FFFFFF",
        success: "#15803D",
        warning: "#D97706",
        error: "#DC2626",
      },
    },
  },
  plugins: [],
};