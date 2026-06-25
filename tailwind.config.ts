/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        primary: ['Poppins', 'sans-serif'],
        secondary: ['Poppins', 'sans-serif'],
      },
      fontSize: {
        // Display / Emotional Layer
        'hero': ['72px', { lineHeight: '1.2' }],
        'section-opener': ['56px', { lineHeight: '1.23' }],
        'reflective': ['40px', { lineHeight: '1.29' }],
        
        // Structural Headings
        'h1': ['45px', { lineHeight: '1.29' }],
        'h2': ['36px', { lineHeight: '1.33' }],
        'h3': ['29px', { lineHeight: '1.39' }],
        'h4': ['23px', { lineHeight: '1.43' }],
        
        // Reading Layer
        'body-primary': ['20px', { lineHeight: '1.63' }],
        'body-long': ['21px', { lineHeight: '1.68' }],
        'body-secondary': ['18px', { lineHeight: '1.59' }],
        
        // Reflection / Guidance
        'prompt': ['30px', { lineHeight: '1.53' }],
        'guidance': ['25px', { lineHeight: '1.55' }],
        'micro-guidance': ['19px', { lineHeight: '1.59' }],
        
        // UI Layer
        'ui-button': ['20px', { lineHeight: '1.47' }],
        'ui-label': ['16px', { lineHeight: '1.47' }],
        'ui-nav': ['16px', { lineHeight: '1.47' }],
        'ui-helper': ['15px', { lineHeight: '1.47' }],
        'ui-meta': ['14px', { lineHeight: '1.41' }],
      },
      spacing: {
        'hero-copy': '34px',
        'heading-para': '21px',
        'para-para': '22px',
        'section-gap': '92px',
      },
      colors: {
        primary: '#5500CB',
        highlight: '#E5E7EB',
        remaining: '#C9CBC4',
        textSecondary: '#000000',
        brand: '#5500CB',
        brandDark: '#3D0099',
        brandLight: '#C9CBC4',
        accent: '#E5E7EB',
        accentDark: '#D1D5DB',
        accentLight: '#F3F4F6',
        lightestPurple: '#F3E8FF',
        background: '#ffffff',
        foreground: '#000000',
        card: {
          DEFAULT: '#ffffff',
          foreground: '#000000',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#000000',
        },
        border: '#E5E7EB',
        input: '#E5E7EB',
        ring: '#5500CB',
      },
      keyframes: {
        walkScroll: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        }
      },
      animation: {
        walkScroll: 'walkScroll 15s linear infinite',
      }
    },
  },
  plugins: [
    function ({ addUtilities }: { addUtilities: any }) {
      addUtilities({
        '.type-hero': {
          '@apply font-poppins text-hero': {},
        },
        '.type-section-opener': {
          '@apply font-poppins text-section-opener': {},
        },
        '.type-emotional': {
          '@apply font-poppins text-reflective': {},
        },
        '.type-h1': {
          '@apply font-poppins text-h1 font-semibold': {},
        },
        '.type-h2': {
          '@apply font-poppins text-h2 font-semibold': {},
        },
        '.type-h3': {
          '@apply font-poppins text-h3 font-semibold': {},
        },
        '.type-body-primary': {
          '@apply font-poppins text-body-primary': {},
        },
        '.type-body-secondary': {
          '@apply font-poppins text-body-secondary': {},
        },
        '.type-ui-meta': {
          '@apply font-poppins text-ui-meta uppercase tracking-widest font-bold': {},
        },
        '.type-ui-button': {
          '@apply font-poppins text-ui-button font-bold uppercase tracking-widest': {},
        },
        '.type-ui-nav': {
          '@apply font-poppins text-ui-nav font-medium tracking-wide': {},
        },
        '.type-ui-label': {
          '@apply font-poppins text-ui-label uppercase tracking-[0.15em] font-bold': {},
        },
        '.type-ui-helper': {
          '@apply font-poppins text-ui-helper': {},
        },
        '.type-h4': {
          '@apply font-poppins text-h4 font-semibold': {},
        },
        '.type-prompt': {
          '@apply font-poppins text-prompt font-medium italic': {},
        },
        '.type-guidance': {
          '@apply font-poppins text-guidance font-medium': {},
        },
        '.type-micro-guidance': {
          '@apply font-poppins text-micro-guidance': {},
        },
        '.type-body-long': {
          '@apply font-poppins text-body-long': {},
        },
        '.type-reflective': {
          '@apply font-poppins text-reflective': {},
        },
      })
    },
  ],
};