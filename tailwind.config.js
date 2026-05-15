"use strict";

const { addDynamicIconSelectors } = require('@iconify/tailwind');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,css}'],
  safelist: [
    {
      pattern: /^bg-(primary|secondary|error|warning|info|success)(Main|Light|Lighter|Lightest|Dark|Darker|Darkest)?$/
    },
    {
      pattern: /^border-(primary|secondary|error|warning|info|success)(Main|Light|Lighter|Lightest|Dark|Darker|Darkest)?$/
    }
  ],
  corePlugins: {
    preflight: false
  },
  important: '#__next',
  plugins: [
    addDynamicIconSelectors(),
    require('tailwindcss-logical'),
    require('./src/@core/tailwind/plugin')
  ],
  theme: {
    extend: {}
  }
};
