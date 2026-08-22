/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#E50914', // Netflix Red
          hover:   '#f40612',
          muted:   'rgba(229, 9, 20, 0.1)',
        },
        cf: {
          bg:       '#000000', // Deep black background
          base:     '#141414', // Elevated dark
          'base-2': '#181818',
          low:      '#202020',
          mid:      '#2a2a2a',
          high:     '#333333',
          highest:  '#404040',
          elevated: '#181818',
          bright:   '#4d4d4d',
        },
        on: {
          surface:         '#ffffff',
          'surface-dim':   '#b3b3b3',
          muted:           '#808080',
          primary:         '#ffffff',
        },
        error: {
          DEFAULT:   '#E50914',
          container: '#4d0306',
        },
      },
      borderRadius: {
        DEFAULT: '6px',
        sm:   '4px',
        md:   '8px',
        lg:   '12px',
        xl:   '16px',
        '2xl':'24px',
        full: '9999px',
      },
      borderColor: {
        DEFAULT: '#333333',
      },
      boxShadow: {
        'level-1': '0 4px 12px rgba(0,0,0,0.5)',
        'level-2': '0 10px 30px rgba(0,0,0,0.7)',
        'modal':   '0 20px 50px rgba(0,0,0,0.9)',
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-out',
        'slide-up':   'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in':   'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      backdropBlur: {
        xs: '2px',
        sm: '8px',
        md: '16px',
        lg: '24px',
      },
    },
  },
  plugins: [],
}
