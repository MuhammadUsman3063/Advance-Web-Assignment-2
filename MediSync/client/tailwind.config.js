/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#06b6d4", // Cyan-500 (Thoda bright aur vibrant)
        secondary: "#3b82f6", // Blue-500
        darkBg: "#0f172a", // Slate-900 (Gehra background)
        glass: "rgba(255, 255, 255, 0.1)", // Glass effect ke liye
      },
    },
  },
  plugins: [],
};