// eslint-disable-next-line import/unambiguous
const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

const borderColor = '#eee';
const colorPrimary = '#00B812';

module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.{js,jsx,ts,tsx,vue,html,css,scss}'],
  darkMode: false, // or 'media' or 'class'
  important: false,
  theme: {
    screens: {
      xs: '475px',
      ...defaultTheme.screens,
    },
    colors: {
      ...colors,
      transparent: 'transparent',
      current: 'currentColor',

      black: colors.black,
      white: colors.white,
      gray: colors.coolGray,
      red: colors.red,
      yellow: colors.amber,
      blue: colors.blue,
      indigo: colors.indigo,
      purple: colors.violet,
      pink: colors.pink,

      // green: colors.emerald,
      green: {
        50: '#E8FFEA',
        100: '#D0FFD5',
        200: '#B9FFC0',
        300: '#00E617',
        400: '#00CF15',
        500: '#00B812',
        600: '#00AA11',
        700: '#009D10',
        800: '#00900E',
        900: '#00830D',
      },
      'green-one': {
        '': '#F7AC3C',
        0: '#FC7124',
        50: '#e6ffe8',
        100: '#9df2a7',
        200: '#70e682',
        300: '#48d962',
        400: '#23cc47',
        500: '#02be32',
        600: '#00992b',
        700: '#007324',
        800: '#004d1b',
        900: '#00260f',
      },
      'gray-one': {
        50: 'rgba(255, 255, 255, 0.5)',
      },
      orange: {
        100: '#F7AC3C',
        200: '#FC7124',
      },

      nav: {
        bg: '#F7FAFC',
        active: '#E7ECF0',
      },
      shop: {
        'hero-l': '#F5F7F8',
        'hero-r': '#EEF0F2',
        poster: '#2A313D',
        'poster-head': '#4C5769',
        'poster-code': '#131C2B',
        border: '##E6E6E6',
      },
    },
    backgroundColor: (theme) => ({
      ...theme('colors'),
      primary: colorPrimary,
      'root-html': '#2c2d30',
      'root-body': '#f3f3f3', // bg-root-body
      'nav-bar': '#fff',
    }),
    borderColor: (theme) => ({
      ...theme('colors'),
      DEFAULT: borderColor,
      primary: colorPrimary,
      // secondary: '#ffed4a',
      // danger: '#e3342f',
    }),
    textColor: (theme) => ({
      ...theme('colors'),
      DEFAULT: '#363636',
      primary: colorPrimary,
      'root-body': '#363636',
    }),
    extend: {},
  },
  variants: {
    extend: {
      opacity: ['disabled'],
    },
  },
  plugins: [],
};
