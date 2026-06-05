/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6eef7',
          100: '#ccddef',
          200: '#99bbdf',
          300: '#6699cf',
          400: '#3377bf',
          500: '#003B7A',
          600: '#002f61',
          700: '#002349',
          800: '#001830',
          900: '#000c18',
          DEFAULT: '#003B7A',
        },
        secondary: {
          50: '#fef9e6',
          100: '#fdf3cd',
          200: '#fbe79b',
          300: '#f9db69',
          400: '#f7cf37',
          500: '#F4B400',
          600: '#c39000',
          700: '#926c00',
          DEFAULT: '#F4B400',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 10px 25px -5px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
        'nav': '0 1px 3px 0 rgba(0,0,0,0.08)',
        'glass': '0 8px 32px 0 rgba(0,59,122,0.08)',
        'glow': '0 0 20px rgba(0,59,122,0.3)',
      },
    },
  },
  plugins: [],
};
