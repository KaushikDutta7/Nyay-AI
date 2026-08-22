/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink:      '#080808',
        ink2:     '#0f0f0f',
        ink3:     '#181818',
        ink4:     '#222222',
        parchment:'#f0ece4',
        mist:     '#a8a39b',
        ghost:    '#484440',
        gold:     '#C8A951',
        'gold-dim':'#8B7535',
        'gold-glow':'rgba(200,169,81,0.15)',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        ui:      ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-up':   'fadeUp 0.6s ease both',
        'fade-in':   'fadeIn 0.4s ease both',
        'scan':      'scan 2s ease-in-out infinite',
        'pulse-gold':'pulseGold 2s ease-in-out infinite',
        'float':     'float 6s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'blink':     'blink 1s step-end infinite',
      },
      keyframes: {
        fadeUp:    { from:{ opacity:0, transform:'translateY(20px)' }, to:{ opacity:1, transform:'translateY(0)' } },
        fadeIn:    { from:{ opacity:0 }, to:{ opacity:1 } },
        scan:      { '0%,100%':{ transform:'translateX(-100%)' }, '50%':{ transform:'translateX(400%)' } },
        pulseGold: { '0%,100%':{ boxShadow:'0 0 0 0 rgba(200,169,81,0.3)' }, '50%':{ boxShadow:'0 0 0 8px rgba(200,169,81,0)' } },
        float:     { '0%,100%':{ transform:'translateY(0px) rotate(0deg)' }, '50%':{ transform:'translateY(-12px) rotate(0.5deg)' } },
        blink:     { '0%,100%':{ opacity:1 }, '50%':{ opacity:0 } },
      },
    },
  },
  plugins: [],
}
