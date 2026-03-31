/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        chicago: {
          blue: '#41B6E6',
          red: '#CC1628',
          dark: '#0f172a',
          card: '#1e293b',
          border: '#334155',
        },
      },
    },
  },
  plugins: [],
};
