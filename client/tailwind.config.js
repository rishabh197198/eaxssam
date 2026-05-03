/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        examPrimary: '#1a1a1a',   // Solid charcoal for text/headers
        examSecondary: '#3b82f6', // Professional blue for actions
        examBg: '#f8fafc',        // Very light slate for backgrounds
        examBorder: '#e2e8f0',    // Soft borders instead of shadows
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Standard professional look
      },
    },
  },
  plugins: [],
}