import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e3a5f',
          dark: '#152843',
          light: '#2c5282',
        },
        accent: {
          orange: '#ff6b35',
          teal: '#4a9ba7',
          blue: '#63a2aa',
        },
        background: {
          warm: '#ffffff',
          soft: '#f8f9fa',
          dark: '#1e3a5f',
        },
        neutral: {
          light: '#e5e7eb',
          medium: '#9ca3af',
          dark: '#374151',
        },
      },
      fontFamily: {
        heading: ['var(--font-grotesque)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        accent: ['var(--font-accent)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'soft': '0.5rem',
        'fluid': '1rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}
export default config
