/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Signal amber — control-panel indicator lamp. Primary brand accent.
        primary: {
          50: '#FFF9EB', 100: '#FEF0C7', 200: '#FDDE8A', 300: '#FCC94D',
          400: '#F7AE2A', 500: '#EF9712', 600: '#CC7A0A', 700: '#A35F0C',
          800: '#834B10', 900: '#5E3610', 950: '#331C08',
        },
        // Trace blue — oscilloscope / live-data line. Secondary accent.
        secondary: {
          50: '#EAF8FF', 100: '#CDEFFF', 200: '#9FE0FF', 300: '#63CBFF',
          400: '#34B4F5', 500: '#159CDE', 600: '#0B7FBF', 700: '#0C6598',
          800: '#10527A', 900: '#124467', 950: '#0A2C46',
        },
        // Alarm red — E-stop / fault. Used sparingly.
        accent: {
          400: '#FF6B57', 500: '#F0472F', 600: '#C93A26',
        },
        surface: {
          base: '#0B0D10',
          card: '#12151A',
          raised: '#1A1E25',
        },
        line: '#242A33',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        'glow-primary': '0 0 40px -10px rgba(239, 151, 18, 0.5)',
        'glow-secondary': '0 0 40px -10px rgba(21, 156, 222, 0.5)',
        'glow-sm': '0 0 15px -3px rgba(255, 255, 255, 0.15)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'card-hover': '0 20px 60px -15px rgba(0, 0, 0, 0.6), 0 0 40px -10px rgba(239, 151, 18, 0.15)',
        'inner-glow': 'inset 0 0 30px rgba(239, 151, 18, 0.05)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh': 'radial-gradient(at 40% 20%, hsla(38,90%,55%,0.14) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(199,90%,55%,0.12) 0px, transparent 50%), radial-gradient(at 0% 60%, hsla(38,80%,50%,0.07) 0px, transparent 50%)',
        'blueprint': 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
        'blueprint-fine': 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        'hazard': 'repeating-linear-gradient(135deg, #EF9712 0px, #EF9712 10px, #1A1E25 10px, #1A1E25 20px)',
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
        'blink': 'blink 2.4s ease-in-out infinite',
        'scan': 'scan 3.2s cubic-bezier(0.45, 0, 0.55, 1) infinite',
        'trace': 'trace 4.5s ease-in-out infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(40px, -60px) scale(1.15)' },
          '66%': { transform: 'translate(-30px, 30px) scale(0.85)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(25px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { '0%': { opacity: '0', transform: 'translateY(-25px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideLeft: { '0%': { opacity: '0', transform: 'translateX(30px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        slideRight: { '0%': { opacity: '0', transform: 'translateX(-30px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.9)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        gradientShift: { '0%, 100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        orbit: { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
        glowPulse: { '0%, 100%': { opacity: '0.4', transform: 'scale(1)' }, '50%': { opacity: '0.8', transform: 'scale(1.05)' } },
        borderFlow: { '0%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' }, '100%': { backgroundPosition: '0% 50%' } },
        tilt: { '0%, 100%': { transform: 'rotate(0deg)' }, '25%': { transform: 'rotate(0.5deg)' }, '75%': { transform: 'rotate(-0.5deg)' } },
        countUp: { '0%': { opacity: '0', transform: 'translateY(10px) scale(0.95)' }, '100%': { opacity: '1', transform: 'translateY(0) scale(1)' } },
        blink: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.35' } },
        scan: { '0%': { backgroundPosition: '0% 0' }, '100%': { backgroundPosition: '0% 200%' } },
        trace: {
          '0%, 100%': { strokeDashoffset: '0' },
          '50%': { strokeDashoffset: '-120' },
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
