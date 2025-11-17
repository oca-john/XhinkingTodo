/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 颜色主题
        'milk-white': '#F8F6F0',
        'dark-gray': '#2D2D2D',
        'dark-red': '#4A2C2C',
        'light-yellow': '#FFF9E6',
        'gray-green': '#E8F0E8',
        'gray-blue': '#E8EDF5',
        'light-purple': '#F0E8F5',
        // ColorTag 颜色
        'tag-red': '#FF4444',
        'tag-orange': '#FF8844',
        'tag-yellow': '#FFCC44',
        'tag-green': '#44CC44',
        'tag-cyan': '#44CCCC',
        'tag-blue': '#4488FF',
        'tag-purple': '#8844FF',
      },
      animation: {
        'slide-in': 'slideIn 0.2s ease-out',
        'slide-out': 'slideOut 0.2s ease-in',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
