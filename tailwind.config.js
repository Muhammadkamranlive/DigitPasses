/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f6f4ff',
          100: '#eee9ff',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#6c60fe',
          500: '#5d16ec',
          600: '#4c12c4',
          700: '#3b0e9b',
          800: '#2a0b73',
          900: '#0e0e46',
        },
        ink: {
          50: '#f7f7fb',
          100: '#eef0f7',
          500: '#5b5d76',
          700: '#2c2e48',
          900: '#05060f',
        },
        accent: '#175cff',
        danger: '#fd3358',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 20px 50px -20px rgba(93, 22, 236, 0.35)',
        pass: '0 25px 60px -15px rgba(5, 6, 15, 0.45)',
      },
      backgroundImage: {
        'hero-grid':
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(108, 96, 254, 0.35), transparent), linear-gradient(180deg, #0e0e46 0%, #05060f 100%)',
      },
    },
  },
  plugins: [],
};
