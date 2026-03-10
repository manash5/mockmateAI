/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#080e1f', mid: '#0f1b38', soft: '#162244' },
        purple: { DEFAULT: '#6c63ff', bright: '#8b85ff', pale: '#ede9ff' },
        cyan: { DEFAULT: '#00d4ff' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
