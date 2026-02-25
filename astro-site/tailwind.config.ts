import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx,vue,svelte}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.5rem',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: {
        '2xl': '80rem',
      },
    },
    extend: {
      colors: {
        brand: {
          50: '#f1f5fb',
          100: '#dce8f7',
          200: '#b8d0ef',
          300: '#8fb3e2',
          400: '#6392d2',
          500: '#4479bf',
          600: '#2f609f',
          700: '#264d80',
          800: '#1f416b',
          900: '#1e3a5f',
          950: '#152843',
        },
        accent: {
          orange: '#ff6b35',
          teal: '#4a9ba7',
          sky: '#63a2aa',
        },
        neutral: {
          50: '#f8f9fa',
          100: '#f1f3f5',
          200: '#e5e7eb',
          400: '#9ca3af',
          600: '#4b5563',
          700: '#374151',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        accent: ['"Playfair Display"', 'ui-serif', 'Georgia', 'serif'],
      },
      fontSize: {
        display: ['clamp(2.2rem, 4vw, 3.75rem)', { lineHeight: '1.1', fontWeight: '700' }],
        h1: ['clamp(2rem, 3.6vw, 3rem)', { lineHeight: '1.1', fontWeight: '700' }],
        h2: ['clamp(1.5rem, 2.6vw, 2rem)', { lineHeight: '1.2', fontWeight: '700' }],
        h3: ['1.5rem', { lineHeight: '1.25', fontWeight: '700' }],
        body: ['1.125rem', { lineHeight: '1.65' }],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
        30: '7.5rem',
      },
      boxShadow: {
        card: '0 12px 35px -20px rgba(17, 24, 39, 0.35)',
        glow: '0 20px 45px -25px rgba(30, 58, 95, 0.7)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out both',
      },
    },
  },
} satisfies Config;
