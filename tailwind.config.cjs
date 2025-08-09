/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['Poppins', 'sans-serif'],
        },
        fontSize: {
          base: '1rem', // 16px
          sm: '0.875rem', // 14px
          lg: '1.125rem', // 18px
          xl: '1.25rem', // 20px
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
          '5xl': '3rem',
          '6xl': '4rem',
          xs: '0.75rem',     // 12px 
          '2xs': '0.625rem', // 10px
          '3xs': '0.5rem',  //8px
          '4xs': '0.375rem', //6px
          '5xs': '0.25rem', //4px
          '6xs': '0.125rem', //2px
        },
        keyframes: {
          spinOnce: {
            from: { transform: 'rotate(0deg)' },
            to: { transform: 'rotate(360deg)' },
          },
        },
        animation: {
          'spin-once': 'spinOnce 0.25s linear',
        },
      },
    },
    plugins: [],
  }
  