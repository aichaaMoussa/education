/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        /** Palette logo itkane */
        platform: {
          950: '#071F3F',
          800: '#082551',
          600: '#124E9C',
          400: '#1FA0D9',
          200: '#4FE1FF',
        },
      },
    },
  },
  plugins: [],
}
