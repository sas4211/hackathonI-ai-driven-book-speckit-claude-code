/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{jsx,tsx,js,ts,md,mdx}',
    './docs/**/*.{md,mdx}',
    './blog/**/*.{md,mdx}',
    './src/theme/**/*.{jsx,tsx,js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        book: {
          bg: '#fafbfc',
          sidebar: '#f8fafc',
          border: '#e2e8f0',
        },
      },
      spacing: {
        sidebar: '16rem',
        'sidebar-md': '20rem',
        'sidebar-lg': '22rem',
      },
      maxWidth: {
        'book-content': 'none',
        'book-lg': '768px',
        'book-xl': '1024px',
      },
      fontSize: {
        'book-xs': ['0.875rem', { lineHeight: '1.5' }],
        'book-sm': ['1rem', { lineHeight: '1.75' }],
        'book-base': ['1.125rem', { lineHeight: '1.8' }],
        'book-lg': ['1.25rem', { lineHeight: '1.75' }],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};