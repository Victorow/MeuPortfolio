import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './content/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#030305',
        fg: '#F2F2F0',
        ink: {
          950: '#030305',
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
        accent: {
          earth: '#5FA8FF',
          mars: '#D96A3C',
          jupiter: '#E0A862',
          saturn: '#E8C98A',
          uranus: '#8FD8E8',
          venus: '#F0D9A0',
          neptune: '#3E6CFF',
          deep: '#B8C4FF'
        }
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      letterSpacing: {
        tightest: '-0.04em',
        wider2: '0.14em',
        wider3: '0.22em'
      },
      fontSize: {
        'display-xl': ['clamp(3.5rem, 12vw, 11rem)', { lineHeight: '0.88', letterSpacing: '-0.04em' }],
        'display-lg': ['clamp(2.5rem, 8vw, 7rem)', { lineHeight: '0.92', letterSpacing: '-0.03em' }],
        'display-md': ['clamp(2.2rem, 5vw, 4.5rem)', { lineHeight: '0.98', letterSpacing: '-0.02em' }]
      },
      transitionTimingFunction: {
        cine: 'cubic-bezier(0.22, 1, 0.36, 1)'
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } }
      },
      animation: {
        marquee: 'marquee 28s linear infinite'
      }
    }
  },
  plugins: []
};
export default config;
