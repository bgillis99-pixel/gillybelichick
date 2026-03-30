/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./samantha.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'carb-navy': '#003366',
        'carb-green': '#00C853',
        'sam-cream': '#FFF8F0',
        'sam-coral': '#E8725A',
        'sam-amber': '#F4A261',
        'sam-text': '#2D2D2D',
        'sam-muted': '#8B8B8B',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'breathe': 'breathe 1.5s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
