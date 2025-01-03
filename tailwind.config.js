/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',     // All pages
    './app/**/*.{js,ts,jsx,tsx}',       // App folder (if you're using the App Router in Next.js)
    './components/**/*.{js,ts,jsx,tsx}', // Components folder
    './styles/**/*.{css}',              // Global styles
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
