/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],

  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "brand-green": "#8CB369",
        "brand-green-deep": "#4F7942",
        "brand-clay": "#C97B4A",
        paper: "#F5EFE1",
        surface: "#FFFFFF",
        ink: "#2E3527",
        "ink-soft": "#767C6C",
        line: "#E3DCC8",
        danger: "#C1473F",
      },
    },
  },
  plugins: [],
};
