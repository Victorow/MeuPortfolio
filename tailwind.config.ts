import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#060607',
          900: '#0A0A0B',
          800: '#111113',
          700: '#141416',
          600: '#1B1B1E',
          500: '#2A2A2E',
          400: '#3A3A3F',
          300: '#6B6B72',
          200: '#9A9AA0',
          100: '#C9C9CE',
          50: '#E6E6E8'
        },
        glow: 'rgba(220,230,255,0.08)'
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui']
      },
      letterSpacing: {
        tightest: '-0.04em',
        wider2: '0.14em',
        wider3: '0.22em'
      },
      fontSize: {
        'display-xl': ['clamp(3.5rem, 12vw, 11rem)', { lineHeight: '0.9', letterSpacing: '-0.04em' }],
        'display-lg': ['clamp(2.5rem, 8vw, 7rem)', { lineHeight: '0.92', letterSpacing: '-0.03em' }],
        'display-md': ['clamp(2rem, 5vw, 4rem)', { lineHeight: '0.98', letterSpacing: '-0.02em' }]
      },
      boxShadow: {
        glow: '0 0 80px 0 rgba(220,230,255,0.06)',
        panel: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 30px 60px -30px rgba(0,0,0,0.8)'
      },
      transitionTimingFunction: {
        cine: 'cubic-bezier(0.22, 1, 0.36, 1)'
      }
    }
  },
  plugins: []
};
export default config;
