/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:'#eef2ff',100:'#e0e7ff',200:'#c7d2fe',300:'#a5b4fc',
          400:'#818cf8',500:'#6366f1',600:'#4f46e5',700:'#4338ca',
          800:'#3730a3',900:'#312e81',
        },
        accent: {
          400:'#34d399',500:'#10b981',600:'#059669',
        },
        surface: {
          base:'#0a0e17',
          card:'#12172a',
          raised:'#171d33',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: {
        'glow-primary': '0 0 40px -8px rgba(99,102,241,0.45)',
        'glow-accent': '0 0 40px -8px rgba(16,185,129,0.4)',
      },
    },
  },
  plugins: [],
}
