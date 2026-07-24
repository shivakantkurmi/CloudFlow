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
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          light: 'var(--accent-light)',
          dark: 'var(--accent-dark)',
        },
        accent: {
          violet: '#8b5cf6',
          cyan: '#06b6d4',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
        },
        surface: {
          DEFAULT: '#ffffff',
          2: '#f8fafc',
          3: '#f1f5f9',
          dark: '#0f0f11',
          dark2: '#18181c',
          dark3: '#1f1f26',
          dark4: '#27272f',
        },
        border: {
          DEFAULT: '#e2e8f0',
          dark: '#2a2a35',
          dark2: '#33333f',
        },
        text: {
          primary: '#0f172a',
          secondary: '#64748b',
          muted: '#94a3b8',
          'dark-primary': '#f1f5f9',
          'dark-secondary': '#94a3b8',
          'dark-muted': '#64748b',
        }
      },
      backgroundImage: {
        'gradient-mesh': 'radial-gradient(at 20% 25%, hsla(259, 85%, 61%, 0.15) 0px, transparent 50%), radial-gradient(at 80% 80%, hsla(214, 95%, 55%, 0.1) 0px, transparent 50%)',
        'gradient-mesh-dark': 'radial-gradient(at 20% 25%, hsla(259, 85%, 61%, 0.08) 0px, transparent 50%), radial-gradient(at 80% 80%, hsla(214, 95%, 55%, 0.06) 0px, transparent 50%)',
      },
      boxShadow: {
        'glow': '0 0 40px -10px rgba(99, 102, 241, 0.4)',
        'glow-sm': '0 0 20px -5px rgba(99, 102, 241, 0.3)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.1)',
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.05)',
        'card-dark': '0 1px 3px rgba(0,0,0,0.3), 0 4px 24px rgba(0,0,0,0.25)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.08), 0 24px 48px rgba(0,0,0,0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.6)' },
        }
      },
      transitionDuration: {
        '250': '250ms',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
