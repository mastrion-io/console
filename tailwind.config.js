/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d9efff',
          200: '#bce2ff',
          300: '#8ed0ff',
          400: '#57b4ff',
          500: '#2f93ff',
          600: '#1774f7',
          700: '#0052cc',
          800: '#0d48bf',
          900: '#113e96',
          950: '#0b265c',
        },
        slate: {
          850: '#151e2e',
          950: '#080d1a',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
};
