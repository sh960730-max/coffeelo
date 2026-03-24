/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'eco-green': {
          50: '#E8F5E9',
          100: '#D4E9E2',
          200: '#A8D5BA',
          300: '#6DBF8B',
          400: '#3A7D5C',
          500: '#1E3932',
          600: '#1A322C',
          700: '#152A24',
          800: '#11221D',
          900: '#0D1A16',
          DEFAULT: '#1E3932',
        },
        'coffee-brown': {
          50: '#F5F0EB',
          100: '#E8DDD3',
          200: '#D1BBA7',
          300: '#BA997B',
          400: '#8B6B4A',
          500: '#4B3621',
          600: '#42301D',
          700: '#382818',
          800: '#2E2014',
          900: '#241810',
          DEFAULT: '#4B3621',
        },
        'cream': '#F5F0EB',
        'light-green': '#D4E9E2',
      },
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'Apple SD Gothic Neo',
          'Malgun Gothic',
          'sans-serif',
        ],
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'button': '0 4px 16px rgba(30, 57, 50, 0.3)',
        'button-hover': '0 8px 24px rgba(30, 57, 50, 0.4)',
      },
    },
  },
  plugins: [],
}
