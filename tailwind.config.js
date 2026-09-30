/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['var(--font-outfit)', 'Outfit', 'sans-serif'],
        space: ['var(--font-space)', 'Space Grotesk', 'monospace'],
        work: ['var(--font-work)', 'Work Sans', 'sans-serif'],
        jakarta: ['var(--font-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        merapi: {
          dark: '#020617',
          darker: '#0a0f1d',
          navy: '#0f172a',
          slate: '#1e293b',
          muted: '#475569',
          light: '#fbfbfe',
          amber: {
            DEFAULT: '#d97706',
            light: '#fbbf24',
            warm: '#f59e0b',
            dark: '#b45309',
            deep: '#78350f',
          }
        }
      }
    },
  },
  plugins: [],
};
