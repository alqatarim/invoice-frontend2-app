'use client'

import React, { forwardRef } from 'react'
import MuiButton from '@mui/material/Button'
import { alpha, styled } from '@mui/material/styles'

const tonalBackgroundBySkin = {
  light: 'lightOpacity',
  lighter: 'lighterOpacity',
  lightest: 'lightestOpacity',
}

const resolvePaletteColor = (theme, color = 'primary') => {
  if (color === 'inherit') {
    return {
      main: theme.palette.text.primary,
      contrastText: theme.palette.background.paper,
      tonalBackground: alpha(theme.palette.text.primary, 0.08),
      tonalHoverBackground: alpha(theme.palette.text.primary, 0.12),
    }
  }

  const paletteColor = theme.palette[color] || theme.palette.primary
  const main = paletteColor.main || theme.palette.primary.main

  return {
    main,
    contrastText: paletteColor.contrastText || theme.palette.primary.contrastText,
    tonalBackground: paletteColor.lighterOpacity || paletteColor.lightOpacity || alpha(main, 0.12),
    tonalHoverBackground: paletteColor.lightOpacity || alpha(main, 0.18),
  }
}

const StyledButton = styled(MuiButton, {
  shouldForwardProp: prop => prop !== 'skin',
})(({ color = 'primary', disableElevation = true, skin = 'lighter', theme, variant }) => {
  if (variant !== 'tonal') return {}

  const paletteColor = resolvePaletteColor(theme, color)
  const opacityToken = tonalBackgroundBySkin[skin] || tonalBackgroundBySkin.lighter
  const cssVarBackground =
    color !== 'inherit' ? `var(--mui-palette-${color}-${opacityToken})` : paletteColor.tonalBackground
  const cssVarHoverBackground =
    color !== 'inherit' ? `var(--mui-palette-${color}-lightOpacity)` : paletteColor.tonalHoverBackground

  return {
    border: 'none',
    boxShadow: disableElevation ? 'none' : undefined,
    backgroundColor: cssVarBackground,
    color: color !== 'inherit' ? `var(--mui-palette-${color}-main)` : paletteColor.main,
    '&:hover': {
      backgroundColor: cssVarHoverBackground,
      boxShadow: 'none',
    },
    '&:active': {
      backgroundColor: cssVarHoverBackground,
      boxShadow: 'none',
    },
    '&.Mui-disabled': {
      opacity: 0.45,
      color: color !== 'inherit' ? `var(--mui-palette-${color}-main)` : paletteColor.main,
      backgroundColor: cssVarBackground,
    },
  }
})

const CustomButton = forwardRef((props, ref) => {
  const { color = 'primary', disableElevation = true, skin = 'lighter', variant = 'text', ...rest } = props

  return (
    <StyledButton
      ref={ref}
      color={color}
      disableElevation={disableElevation}
      skin={skin}
      variant={variant}
      {...rest}
    />
  )
})

CustomButton.displayName = 'CustomButton'

export default CustomButton
