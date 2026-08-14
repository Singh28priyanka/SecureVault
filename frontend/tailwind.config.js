/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // "Aurora" palette — a deep indigo night sky with teal / violet / amber light.
        ink: {
          950: '#0a0a1a',
          900: '#0f1023',
          850: '#14162e',
          800: '#1a1c38',
          700: '#242745',
          600: '#2f3357',
        },
        aurora: {
          teal: '#2dd4bf',
          cyan: '#22d3ee',
          sky: '#38bdf8',
          violet: '#a78bfa',
          purple: '#8b5cf6',
          pink: '#f472b6',
          amber: '#fbbf24',
          lime: '#a3e635',
          rose: '#fb7185',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(167,139,250,0.15), 0 8px 40px -8px rgba(139,92,246,0.35)',
        'glow-teal': '0 0 0 1px rgba(45,212,191,0.18), 0 8px 40px -8px rgba(45,212,191,0.30)',
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 50px -24px rgba(0,0,0,0.7)',
      },
      backgroundImage: {
        'aurora-radial':
          'radial-gradient(1200px 600px at 10% -10%, rgba(139,92,246,0.20), transparent 60%), radial-gradient(1000px 500px at 100% 0%, rgba(45,212,191,0.16), transparent 55%), radial-gradient(900px 600px at 50% 120%, rgba(56,189,248,0.12), transparent 60%)',
        'brand-gradient': 'linear-gradient(120deg, #2dd4bf 0%, #38bdf8 40%, #a78bfa 100%)',
      },
      keyframes: {
        floaty: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        shimmer: 'shimmer 6s linear infinite',
        'fade-up': 'fade-up 0.4s ease-out both',
      },
    },
  },
  plugins: [],
}
