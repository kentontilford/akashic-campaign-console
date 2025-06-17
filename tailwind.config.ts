import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        akashic: {
          primary: '#2563eb',   // Strategic blue
          secondary: '#64748b', // Professional gray
          accent: '#059669',    // Success green
          danger: '#dc2626',    // Red for alerts
          warning: '#f59e0b',   // Yellow for warnings
        }
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'akashic': '0.75rem', // Rounded, professional feel
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
      },
    },
  },
  plugins: [],
}

export default config