'use client'

import MuiButton from '@mui/material/Button'
import { lighten, styled } from '@mui/material/styles'
import React, { forwardRef } from 'react'




const CustomIconButton = styled(MuiButton)(({ skin, color, size, theme }) => {
  return {
    minInlineSize: 0,
    border: 'none !important',
    boxShadow: 'none !important',

    // Size-based styling
    ...(size === 'small' ? {
      fontSize: '20px',
      padding: theme.spacing(1.75),
      '& i, & svg': { fontSize: 'inherit' }
    } : {
      ...(size === 'large' ? {
        fontSize: '24px',
        padding: theme.spacing(2.25),
        '& i, & svg': { fontSize: 'inherit' }
      } : {
        fontSize: '22px',
        padding: theme.spacing(2),
        '& i, & svg': { fontSize: 'inherit' }
      })
    }),

    // Color-based styling - exactly matching Avatar
    ...(color &&
      skin === 'light' && {
        backgroundColor: `var(--mui-palette-${color}-lightOpacity)`,
        color: `var(--mui-palette-${color}-main)`,
        '&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active': {
          backgroundColor: `var(--mui-palette-${color}-lightOpacity)`,
        }
      }),

        ...(color &&
      skin === 'lighter' && {
        backgroundColor: `var(--mui-palette-${color}-lighterOpacity)`,
        color: `var(--mui-palette-${color}-main)`,
        '&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active': {
          backgroundColor: `var(--mui-palette-${color}-lighterOpacity)`,
        }
      }),

              ...(color &&
      skin === 'lightest' && {
         backgroundColor: `var(--mui-palette-${color}-lightestOpacity)`,
        color: `var(--mui-palette-${color}-main)`,
        '&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active': {
          backgroundColor: `var(--mui-palette-${color}-lightestOpacity)`,
        }
      }),

    ...(color &&
      skin === 'light-static' && {
        backgroundColor: lighten(theme.palette[color].main, 0.84),
        color: `var(--mui-palette-${color}-main)`,
        '&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active': {
          backgroundColor: lighten(theme.palette[color].main, 0.84),
        }
      }),

    ...(color &&
      skin === 'filled' && {
        backgroundColor: `var(--mui-palette-${color}-main)`,
        color: `var(--mui-palette-${color}-contrastText)`,
        '&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active': {
          backgroundColor: `var(--mui-palette-${color}-main)`,
        }
      }),

    // Button-specific hover effect
    '&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active': {
      opacity: 0.85
    },

    // Disabled state
    '&.Mui-disabled': {
      opacity: 0.45
    }
  }
})



const IconButtonWrapper = forwardRef((props, ref) => {
  // Props
  const { color, skin = 'filled', ...rest } = props

  return <CustomIconButton ref={ref} color={color} skin={skin} {...rest} />
})

export default IconButtonWrapper
