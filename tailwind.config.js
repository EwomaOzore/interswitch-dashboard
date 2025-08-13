/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        interswitch: {
          dark: '#00425F',
          primary: '#479FC8',
        },
        success: '#28A745',
        danger: '#E53935',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '16px',
        '4': '24px',
        '5': '32px',
      },
      fontSize: {
        base: ['16px', { lineHeight: '1.5' }],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}