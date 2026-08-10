/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd',
          400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9',
          800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065',
        },
        secondary: {
          50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9',
          400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490',
          800: '#155e75', 900: '#164e63', 950: '#083344',
        },
        accent: {
          400: '#f472b6', 500: '#ec4899', 600: '#db2777',
        },
        surface: {
          base: '#0B0C10',
          card: '#12141A',
          raised: '#1F222E',
        },
      },
      fontFamily: { 
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 40px -10px rgba(139, 92, 246, 0.5)',
        'glow-secondary': '0 0 40px -10px rgba(6, 182, 212, 0.5)',
        'glow-sm': '0 0 15px -3px rgba(255, 255, 255, 0.15)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'card-hover': '0 20px 60px -15px rgba(0, 0, 0, 0.6), 0 0 40px -10px rgba(139, 92, 246, 0.15)',
        'inner-glow': 'inset 0 0 30px rgba(139, 92, 246, 0.05)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh': 'radial-gradient(at 40% 20%, hsla(260,100%,74%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(340,100%,76%,0.15) 0px, transparent 50%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      animation: {
        'blob': 'blob 10s infinite alternate',
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-left': 'slideLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-right': 'slideRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'orbit': 'orbit 20s linear infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'border-flow': 'borderFlow 4s linear infinite',
        'tilt': 'tilt 10s ease-in-out infinite',
        'count-up': 'countUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(40px, -60px) scale(1.15)' },
          '66%': { transform: 'translate(-30px, 30px) scale(0.85)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(25px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-25px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        borderFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        tilt: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(0.5deg)' },
          '75%': { transform: 'rotate(-0.5deg)' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      transitionTimingFunction: {
        'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}

