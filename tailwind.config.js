/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'neon-cyan': '#00f0ff',
        'neon-purple': '#bd00ff',
        'neon-magenta': '#ff0055',
        'neon-yellow': '#ffb800',
        'neon-green': '#39ff14',
        'bg-dark': '#07070c',
        'bg-darker': '#040407',
        'text-primary': '#f1f5f9',
        'text-secondary': '#94a3b8',
        'text-muted': '#64748b',
      },
      fontFamily: {
        header: ['Orbitron', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        body: ['Rajdhani', 'sans-serif'],
      },
      animation: {
        'rotate-cube': 'rotateCube 20s infinite linear',
        'zoom-in': 'zoomIn 0.3s ease',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'card-reveal': 'cardReveal 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
        'scan-line': 'scanLine 3s linear infinite',
        'counter-up': 'counterUp 0.5s ease forwards',
        'fade-in-up': 'fadeInUp 0.4s ease forwards',
      },
      keyframes: {
        rotateCube: {
          '0%': { transform: 'rotateX(0deg) rotateY(0deg)' },
          '100%': { transform: 'rotateX(360deg) rotateY(360deg)' },
        },
        zoomIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 240, 255, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 240, 255, 0.7), 0 0 60px rgba(0, 240, 255, 0.3)' },
        },
        cardReveal: {
          '0%': { transform: 'scale(0.92) translateY(20px)', opacity: '0' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        fadeInUp: {
          '0%': { transform: 'translateY(15px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
