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
        ink:    '#141B14',
        forest: '#1E4D2B',
        leaf:   '#3A7D44',
        gold:   '#C9973A',
        linen:  '#F5F0E8',
        sand:   '#E8DFD0',
        moss:   '#7FAF7B',
        mid:    '#5C6B5E',
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '3px',
        md: '4px',
        lg: '6px',
        xl: '8px',
      },
      boxShadow: {
        card: '0 2px 16px rgba(0,0,0,0.06)',
        panel: '0 8px 32px rgba(0,0,0,0.12)',
        deep: '0 24px 64px rgba(0,0,0,0.22)',
      },
    },
  },
  plugins: [],
}

export default config
