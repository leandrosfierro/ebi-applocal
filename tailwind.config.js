/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: { card: "0 8px 30px rgba(2,6,23,0.06)" }
    },
  },
  plugins: [],
};