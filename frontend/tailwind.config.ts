import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['var(--font-pixel)', 'monospace'],
        display: ['var(--font-display)', 'var(--font-ibm-thai)', 'sans-serif'],
        thai: ['var(--font-ibm-thai)', 'var(--font-body)', 'sans-serif'],
        sans: ['var(--font-body)', 'var(--font-ibm-thai)', 'sans-serif'],
      },
      colors: {
        parchment: {
          DEFAULT: '#f8f5ec',
          card: '#fffdf7',
          dark: '#ede6d3',
        },
      },
      boxShadow: {
        arcade: '4px 4px 0px 0px #0f172a',
        'arcade-lg': '6px 6px 0px 0px #0f172a',
        'arcade-sm': '2px 2px 0px 0px #0f172a',
      },
    },
  },
  plugins: [],
};

export default config;
