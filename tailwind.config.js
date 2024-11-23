"use strict";

const { addDynamicIconSelectors } = require('@iconify/tailwind');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,ts,jsx,tsx,css}'],
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
