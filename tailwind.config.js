/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
colors: {
        primary: '#5B63D3',
        secondary: '#8B92E8',
        accent: '#FF6B6B',
        surface: '#FFFFFF',
        background: '#F7F8FC',
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
        info: '#2196F3',
        timeline: {
          grid: '#f8fafc',
          border: '#e5e7eb',
          today: '#ef4444',
          dependency: '#5b63d3'
        },
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '0.875rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'lg': '8px',
        'xl': '12px',
      },
backdropBlur: {
        xs: '2px',
      },
      zIndex: {
        '60': '60',
        '70': '70',
      },
      minWidth: {
        '32': '8rem',
        '48': '12rem',
      },
      gridTemplateColumns: {
        'timeline': '200px 1fr',
        'timeline-lg': '250px 1fr',
      },
    },
  },
  plugins: [],
}