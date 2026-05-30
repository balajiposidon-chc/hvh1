/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2d4a22', // Forest Green
          light: '#3a5f2c',
          dark: '#1e3316',
        },
        secondary: {
          DEFAULT: '#6b705c', // Olive Green
        },
        accent: {
          DEFAULT: '#cb997e', // Warm Brown
        },
        neutral: {
          100: '#fefae0', // Cream
          200: '#e9edc9', // Sand
          800: '#333333', // Dark Charcoal
          900: '#222222',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
