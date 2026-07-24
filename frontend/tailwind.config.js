/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Indigo-anchored primary (was flat blue) — reads more "premium LMS"
        primary: {
          50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
          400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
          800: '#3730a3', 900: '#312e81',
        },
        accent: { 400: '#34d399', 500: '#10b981', 600: '#059669' },
        surface: { 0: '#ffffff', 50: '#f8fafc', 100: '#f1f5f9' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: {
        card: '0 1px 2px 0 rgba(15,23,42,0.04), 0 1px 3px 0 rgba(15,23,42,0.06)',
        'card-hover': '0 12px 24px -8px rgba(15,23,42,0.12), 0 4px 8px -4px rgba(15,23,42,0.08)',
        glow: '0 0 0 1px rgba(99,102,241,0.08), 0 8px 24px -8px rgba(79,70,229,0.35)',
      },
      keyframes: {
        'fade-slide-in': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        'scale-in': { from: { opacity: 0, transform: 'scale(0.96)' }, to: { opacity: 1, transform: 'scale(1)' } },
      },
      animation: {
        'fade-slide-in': 'fade-slide-in 0.25s ease-out both',
        'scale-in': 'scale-in 0.2s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
}
