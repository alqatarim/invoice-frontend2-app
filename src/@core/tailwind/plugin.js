import plugin from 'tailwindcss/plugin'

module.exports = plugin(function ({ addUtilities }) {
  addUtilities({
    '.text-body1-5': {
      fontSize: '14px',
      lineHeight: '1.46667',
      color: 'var(--mui-palette-text-primary)'
    }
  })
}, {
  theme: {
    borderColor: ({ theme }) => ({
      ...theme('colors'),
      DEFAULT: 'var(--border-color, currentColor)'
    }),
    borderRadius: {
      none: '0px',
      xs: 'var(--mui-shape-customBorderRadius-xs)',
      sm: 'var(--mui-shape-customBorderRadius-sm)',
      DEFAULT: '0.375rem',
      md: 'var(--mui-shape-customBorderRadius-md)',
      lg: 'var(--mui-shape-customBorderRadius-lg)',
      xl: 'var(--mui-shape-customBorderRadius-xl)',
      '2xl': '0.75rem',
      '3xl': '1rem',
      '4xl': '1.5rem',
      full: '9999px'
    },
    screens: {
      sm: '600px',
      md: '900px',
      lg: '1200px',
      xl: '1536px',
      '2xl': '1920px'
    },
    extend: {
      borderWidth: {
        1: '1px',
        3: '3px'
      },
      boxShadow: {
        xs: 'var(--mui-customShadows-xs)',
        sm: 'var(--mui-customShadows-sm)',
        DEFAULT: 'var(--mui-customShadows-md)',
        md: 'var(--mui-customShadows-md)',
        lg: 'var(--mui-customShadows-lg)',
        xl: 'var(--mui-customShadows-xl)'
      },
      colors: {
        primary: 'var(--primary-color)',
        primaryMain: 'var(--mui-palette-primary-main)',
        primaryLight: 'var(--mui-palette-primary-lightOpacity)',
        primaryLighter: 'var(--mui-palette-primary-lighterOpacity)',
        primaryLightest: 'var(--mui-palette-primary-lightestOpacity)',
        primaryDark: 'var(--mui-palette-primary-darkOpacity)',
        primaryDarker: 'var(--mui-palette-primary-darkerOpacity)',
        primaryDarkest: 'var(--mui-palette-primary-darkestOpacity)',
        secondary: 'var(--mui-palette-secondary-main)',
        secondaryMain: 'var(--mui-palette-secondary-main)',
        secondaryLight: 'var(--mui-palette-secondary-lightOpacity)',
        secondaryLighter: 'var(--mui-palette-secondary-lighterOpacity)',
        secondaryLightest: 'var(--mui-palette-secondary-lightestOpacity)',
        secondaryDark: 'var(--mui-palette-secondary-darkOpacity)',
        secondaryDarker: 'var(--mui-palette-secondary-darkerOpacity)',
        secondaryDarkest: 'var(--mui-palette-secondary-darkestOpacity)',
        accent: 'var(--mui-palette-accent-main)',
        accentMain: 'var(--mui-palette-accent-main)',
        accentLight: 'var(--mui-palette-accent-lightOpacity)',
        accentLighter: 'var(--mui-palette-accent-lighterOpacity)',
        accentLightest: 'var(--mui-palette-accent-lightestOpacity)',
        accentDark: 'var(--mui-palette-accent-darkOpacity)',
        accentDarker: 'var(--mui-palette-accent-darkerOpacity)',
        accentDarkest: 'var(--mui-palette-accent-darkestOpacity)',
        error: 'var(--mui-palette-error-main)',
        errorMain: 'var(--mui-palette-error-main)',
        errorLight: 'var(--mui-palette-error-lightOpacity)',
        errorLighter: 'var(--mui-palette-error-lighterOpacity)',
        errorLightest: 'var(--mui-palette-error-lightestOpacity)',
        errorDark: 'var(--mui-palette-error-darkOpacity)',
        errorDarker: 'var(--mui-palette-error-darkerOpacity)',
        errorDarkest: 'var(--mui-palette-error-darkestOpacity)',
        warning: 'var(--mui-palette-warning-main)',
        warningMain: 'var(--mui-palette-warning-main)',
        warningLight: 'var(--mui-palette-warning-lightOpacity)',
        warningLighter: 'var(--mui-palette-warning-lighterOpacity)',
        warningLightest: 'var(--mui-palette-warning-lightestOpacity)',
        warningDark: 'var(--mui-palette-warning-darkOpacity)',
        warningDarker: 'var(--mui-palette-warning-darkerOpacity)',
        warningDarkest: 'var(--mui-palette-warning-darkestOpacity)',
        info: 'var(--mui-palette-info-main)',
        infoMain: 'var(--mui-palette-info-main)',
        infoLight: 'var(--mui-palette-info-lightOpacity)',
        infoLighter: 'var(--mui-palette-info-lighterOpacity)',
        infoLightest: 'var(--mui-palette-info-lightestOpacity)',
        infoDark: 'var(--mui-palette-info-darkOpacity)',
        infoDarker: 'var(--mui-palette-info-darkerOpacity)',
        infoDarkest: 'var(--mui-palette-info-darkestOpacity)',
        success: 'var(--mui-palette-success-main)',
        successMain: 'var(--mui-palette-success-main)',
        successLight: 'var(--mui-palette-success-lightOpacity)',
        successLighter: 'var(--mui-palette-success-lighterOpacity)',
        successDark: 'var(--mui-palette-success-darkOpacity)',
        successDarker: 'var(--mui-palette-success-darkerOpacity)',
        successLightest: 'var(--mui-palette-success-lightestOpacity)',
        successDarkest: 'var(--mui-palette-success-darkestOpacity)',
        textPrimary: 'var(--mui-palette-text-primary)',
        textSecondary: 'var(--mui-palette-text-secondary)',
        textDisabled: 'var(--mui-palette-text-disabled)',
        actionActive: 'var(--mui-palette-action-active)',
        actionHover: 'var(--mui-palette-action-hover)',
        actionSelected: 'var(--mui-palette-action-selected)',
        actionFocus: 'var(--mui-palette-action-focus)',
        backgroundPaper: 'var(--mui-palette-background-paper)',
        backgroundDefault: 'var(--mui-palette-background-default)',
        track: 'var(--mui-palette-customColors-trackBg)',
        backdrop: 'var(--backdrop-color)',
        facebook: '#497ce2',
        twitter: '#1da1f2',
        github: '#272727',
        googlePlus: '#db4437',

        tableHeader: 'var(--mui-palette-customColors-tableHeaderBg)'
      },
      zIndex: {
        header: 'var(--header-z-index)',
        footer: 'var(--footer-z-index)',
        customizer: 'var(--customizer-z-index)',
        search: 'var(--search-z-index)',
        drawer: 'var(--drawer-z-index)'
      }
    }
  }
})
