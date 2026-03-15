/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#c8a84b',
          50:  '#fdf9ee', 100: '#f7edcc', 200: '#efd78a',
          300: '#e5c05a', 400: '#d9aa3c', 500: '#c8a84b',
          600: '#a8852d', 700: '#846422', 800: '#62491a', 900: '#3e2e10',
        },
        // Dark mode surfaces
        dark: {
          bg:      '#0c0c0d',
          surface: '#141415',
          card:    '#1a1a1c',
          border:  '#252527',
          muted:   '#2e2e31',
          text:    '#e2e0db',
          sub:     '#8a8782',
          dim:     '#4a4845',
        },
        // Light mode surfaces
        light: {
          bg:      '#f4f2ee',
          surface: '#faf9f7',
          card:    '#ffffff',
          border:  '#e2dfd9',
          muted:   '#d4d0c9',
          text:    '#1a1816',
          sub:     '#6b6763',
          dim:     '#9e9b96',
        },
      },
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body:    ['"Outfit"', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'monospace'],
      },
      animation: {
        'fade-up':  'fadeUp 0.35s ease forwards',
        'fade-in':  'fadeIn 0.25s ease forwards',
        'slide-in': 'slideIn 0.3s ease forwards',
      },
      keyframes: {
        fadeUp:  { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(-12px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
}
