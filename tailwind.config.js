/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Raleway', 'sans-serif'],
      },
      colors: {
        // Colores principales según especificación
        primary: '#5a25ab',
        secondary: '#fabb2f',
        accent: {
          green: '#50c69a',
          orange: '#fa8534',
          pink: '#ed3f70',
          teal: '#2ec69d',
        },
        light: {
          purple: '#af77f4',
          pink: '#fe7ea1',
          orange: '#fcaf79',
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      }
    },
  },
  plugins: [],
}
