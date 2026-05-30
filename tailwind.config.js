module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './modules/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 24px 80px rgba(14, 34, 23, 0.14)'
      },
      colors: {
        // Storefront colors
        forest: '#1f3f2c',
        olive: '#6b7a47',
        sand: '#f5ebdd',
        cream: '#fbf4ea',
        cocoa: '#69412a',
        charcoal: '#121212',
        
        // Dashboard colors
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
        }
      }
    }
  },
  plugins: []
};
