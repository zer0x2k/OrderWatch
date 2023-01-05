/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
  ],
  darkMode: true,
  theme: {
    extend: {},
  },
  plugins: [
    require('tailwind-scrollbar')({nocompatible: true}),
  ],
  variants: {
    scrollbar: ['dark', 'rounded']
  }
}
