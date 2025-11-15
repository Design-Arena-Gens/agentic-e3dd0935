import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#020420',
        accent: '#675AFE',
        'accent-dark': '#473BE0',
        'accent-light': '#A89DFF',
        surface: '#0B0E2C',
        'surface-light': '#11163B',
        'surface-lighter': '#1A2050'
      },
      boxShadow: {
        glow: '0 0 40px rgba(103, 90, 254, 0.45)'
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif']
      },
      backgroundImage: {
        'noise-gradient': 'linear-gradient(135deg, rgba(103,90,254,0.35), rgba(21,214,255,0.25))'
      }
    }
  },
  plugins: []
};

export default config;
