const svgToDataUri = require('mini-svg-data-uri')

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    colors: {
      gray: {
        900: '#171c28',
        800: '#1d2433',
        700: '#21273b',
        600: '#2a2f3e',
        500: '#293147',
        400: '#7c8da6',
        300: '#b4bdc9',
        200: '#e3e8ee',
        100: '#f5f7fa',
      },
      white: "#ffffff",
      black: "#000000",
      blue: {
        900: '#022021',
        800: '#013336',
        700: '#13505e',
        600: '#1b8196',
        500: '#00d5d7',
        400: '#8be0f0',
        300: '#b3eaf5',
        200: '#d1fdff',
        100: '#ebf7f7',
      },
      red: {
        900: '#2b0e0e',
        800: '#3c1212',
        700: '#4e1717',
        600: '#6a1d1d',
        500: '#8f2525',
        400: '#ef6b73',
        300: '#f4b5bd',
        200: '#f9e3e5',
        100: '#fdf5f6',
      }
    },
    fontWeight: {
      bold: '700',
    },
    container: {
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
    extend: {
      colors: {
        'red-transparent': 'rgba(255, 0, 0, 0.1)',
        'green-transparent': 'rgba(0, 255, 0, 0.1)',
        'blue-transparent': 'rgba(0, 0, 255, 0.1)',
        'blue-transparent-lighter': 'rgba(162, 248, 252, 0.05)',
        'yellow-transparent': 'rgba(255, 255, 0, 0.1)',
      },
      backgroundImage: (theme) => ({
        'multiselect-caret': `url("${svgToDataUri(
          `<svg viewBox="0 0 320 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"></path></svg>`,
        )}")`,
        'multiselect-spinner': `url("${svgToDataUri(
          `<svg viewBox="0 0 512 512" fill="${theme('colors.green.500')}" xmlns="http://www.w3.org/2000/svg"><path d="M456.433 371.72l-27.79-16.045c-7.192-4.152-10.052-13.136-6.487-20.636 25.82-54.328 23.566-118.602-6.768-171.03-30.265-52.529-84.802-86.621-144.76-91.424C262.35 71.922 256 64.953 256 56.649V24.56c0-9.31 7.916-16.609 17.204-15.96 81.795 5.717 156.412 51.902 197.611 123.408 41.301 71.385 43.99 159.096 8.042 232.792-4.082 8.369-14.361 11.575-22.424 6.92z"></path></svg>`,
        )}")`,
        'multiselect-remove': `url("${svgToDataUri(
          `<svg viewBox="0 0 320 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M207.6 256l107.72-107.72c6.23-6.23 6.23-16.34 0-22.58l-25.03-25.03c-6.23-6.23-16.34-6.23-22.58 0L160 208.4 52.28 100.68c-6.23-6.23-16.34-6.23-22.58 0L4.68 125.7c-6.23 6.23-6.23 16.34 0 22.58L112.4 256 4.68 363.72c-6.23 6.23-6.23 16.34 0 22.58l25.03 25.03c6.23 6.23 16.34 6.23 22.58 0L160 303.6l107.72 107.72c6.23 6.23 16.34 6.23 22.58 0l25.03-25.03c6.23-6.23 6.23-16.34 0-22.58L207.6 256z"></path></svg>`,
        )}")`,
      }),
      typography: () => ({
        DEFAULT: {
          css: {
            'ul': {
              listStyleType: 'disc',
              wordWrap: 'break-word',
            },
            'ol': {
              listStyleType: 'decimal',
              wordWrap: 'break-word',
            },
            li: {
              wordWrap: 'break-word',
            },
            p: {
              wordWrap: 'break-word',
            },
            h1: {
              textDecoration: 'none',
              wordWrap: 'break-word',
            },
            h2: {
              textDecoration: 'none',
              wordWrap: 'break-word',
            },
            h3: {
              textDecoration: 'none',
              wordWrap: 'break-word',
            },
            h4: {
              textDecoration: 'none',
              wordWrap: 'break-word',
            },
            h5: {
              textDecoration: 'none',
              wordWrap: 'break-word',
            },
            h6: {
              textDecoration: 'none',
              wordWrap: 'break-word',
            },
          },
        },
      }),
    },
  },
  variants: {
    extend: {
      backgroundColor: ['even'],
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
