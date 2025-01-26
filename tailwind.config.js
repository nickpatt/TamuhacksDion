module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          200: '#8B0000',
          300: '#6B0000',
          400: '#5B0000',
          500: '#500000',
          600: '#400000',
          700: '#300000',
          800: '#200000',
          900: '#100000',
        },
      },
      boxShadow: {
        'elegant': '0 4px 20px -2px rgba(80, 0, 0, 0.2)',
        'card': '0 10px 30px -5px rgba(80, 0, 0, 0.2)',
        'hover': '0 20px 40px -5px rgba(80, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
} 