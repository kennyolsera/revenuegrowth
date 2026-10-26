import type { Config } from 'tailwindcss';

/**
 * Every value points at a CSS variable from app/globals.css,
 * so theme, accent and density switches never need a rebuild.
 */
const v = (name: string) => `var(--${name})`;

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    // Replace (not extend) colours so raw Tailwind palette hexes can't sneak in.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      bg: v('bg'),
      side: v('bg-side'),
      surface: { DEFAULT: v('surface'), 2: v('surface-2'), 3: v('surface-3') },
      sunken: v('sunken'),
      border: { DEFAULT: v('border'), strong: v('border-strong') },
      divider: v('divider'),
      text: { DEFAULT: v('text'), 2: v('text-2'), 3: v('text-3'), 4: v('text-4') },
      overlay: v('overlay'),
      accent: { DEFAULT: v('accent'), soft: v('accent-soft'), line: v('accent-line'), on: v('on-accent') },
      green: v('green'),
      amber: v('amber'),
      red: v('red'),
      blue: v('blue'),
      violet: v('violet'),
      teal: v('teal'),
      rose: v('rose'),
      orange: v('orange'),
      gray: v('gray'),
      chart: { 1: v('chart-1'), 2: v('chart-2'), 3: v('chart-3'), 4: v('chart-4'), muted: v('chart-muted') },
    },
    fontFamily: {
      sans: [v('font')],
      mono: [v('mono')],
    },
    fontSize: {
      '2xs': [v('fs-2xs'), { lineHeight: '1.3' }],
      xs: [v('fs-xs'), { lineHeight: '1.3' }],
      sm: [v('fs-sm'), { lineHeight: '1.45' }],
      base: [v('fs'), { lineHeight: '1.45' }],
      md: [v('fs-md'), { lineHeight: '1.4' }],
      lg: [v('fs-lg'), { lineHeight: '1.3' }],
      xl: [v('fs-xl'), { lineHeight: '1.2', letterSpacing: '-0.02em' }],
      stat: [v('fs-stat'), { lineHeight: '1.2', letterSpacing: '-0.02em' }],
      '2xl': [v('fs-2xl'), { lineHeight: '1.2', letterSpacing: '-0.022em' }],
    },
    fontWeight: {
      normal: '400',
      side: '450',
      medium: '500',
      semibold: '600',
    },
    borderRadius: {
      none: '0',
      xs: v('r-xs'),
      sm: v('r-sm'),
      DEFAULT: v('r'),
      lg: v('r-lg'),
      xl: v('r-xl'),
      sheet: v('r-sheet'),
      full: v('r-full'),
    },
    boxShadow: {
      none: 'none',
      sm: v('shadow-sm'),
      card: v('shadow-card'),
      pop: v('shadow-pop'),
      drag: v('shadow-drag'),
    },
    extend: {
      spacing: {
        gutter: v('gutter'),
        'h-xs': v('h-xs'),
        'h-sm': v('h-sm'),
        'h-md': v('h-md'),
        'h-lg': v('h-lg'),
        row: v('row-h'),
        'side-row': v('side-row'),
        side: v('side-w'),
        topbar: v('topbar-h'),
      },
      transitionDuration: { DEFAULT: '140ms' },
      transitionTimingFunction: {
        DEFAULT: v('ease'),
        spring: v('spring'),
        drawer: v('ease-drawer'),
      },
    },
  },
  plugins: [],
};

export default config;
