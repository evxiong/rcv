/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{html,js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'purple': '#6546E2',
        'gray': '#444444',
      },
      fontFamily: {
        'hanken': ['Hanken Grotesk', 'sans-serif'],
      },
      fontSize: {
        'ss': ['13px', '18px'],
      }
    },
  },
  plugins: [],
}

