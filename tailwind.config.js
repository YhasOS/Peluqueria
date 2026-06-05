/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#ead8cf',
        'primary-light': '#f7efe9',
        secondary: '#fffaf6',
        accent: '#9b6a4f',
        'accent-dark': '#5f3c2b',
        rosebar: '#c99a92',
        text: '#2f2521',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        script: ['Brush Script MT', 'Segoe Script', 'cursive'],
      },
      boxShadow: {
        soft: '0 14px 38px rgba(95, 60, 43, 0.13)',
      },
    },
  },
  plugins: [],
};
