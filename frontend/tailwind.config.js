/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--p-primary-500)',
        secondary: 'var(--p-secondary-500)',
      }
    },
  },
  plugins: [],
}
