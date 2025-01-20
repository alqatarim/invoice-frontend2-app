'use client'
import MuiButton from '@mui/material/Button'
import { styled,  lighten } from '@mui/material/styles'
import React, { forwardRef } from 'react'
// Config Imports
import themeConfig from '@configs/themeConfig'

const CustomIconButton = styled(MuiButton)(({ color, size, theme, variant, skin = 'filled' }) => {
  return {
    minInlineSize: 0,
    ...(size === 'small'
      ? {
          fontSize: '20px',
          padding: theme.spacing(variant === 'outlined' ? 1.5 : 1.75),
          '& i, & svg': {
            fontSize: 'inherit'
          }
        }
      : {
          ...(size === 'large'
            ? {
                fontSize: '24px',
                padding: theme.spacing(variant === 'outlined' ? 2 : 2.25),
                '& i, & svg': {
                  fontSize: 'inherit'
                }
              }
            : {
                fontSize: '22px',
                padding: theme.spacing(variant === 'outlined' ? 1.75 : 2),
                '& i, & svg': {
                  fontSize: 'inherit'
                }
              })
        }),
    ...(!color && {
      color: 'var(--mui-palette-action-active)',
      '&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active': {
        backgroundColor: 'rgb(var(--mui-palette-text-primaryChannel) / 0.08)'
      },
      ...(themeConfig.disableRipple && {
        '&.Mui-focusVisible:not(.Mui-disabled)': {
          backgroundColor: 'rgb(var(--mui-palette-text-primaryChannel) / 0.08)'
        }
      }),
      '&.Mui-disabled': {
        opacity: 0.45,
        color: 'var(--mui-palette-action-active)'
      },
      ...(variant === 'outlined' && {
        border: 'none !important',
        ...(size === 'small'
          ? {
              padding: theme.spacing(1.75)
            }
          : {
              ...(size === 'large'
                ? {
                    padding: theme.spacing(2.25)
                  }
                : {
                    padding: theme.spacing(2)
                  })
            })
      }),
      ...(variant === 'contained' && {
        boxShadow: 'none !important',
        backgroundColor: 'transparent'
      })
    }),
    ...(color && skin === 'light' && {
      backgroundColor: `var(--mui-palette-${color}-lightOpacity)`,
      color: `var(--mui-palette-${color}-main)`,
      '&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active': {
        backgroundColor: `var(--mui-palette-${color}-lightOpacity)`,
      }
    }),
    ...(color && skin === 'light-static' && {
      backgroundColor: lighten(theme.palette[color].main, 0.84),
      color: `var(--mui-palette-${color}-main)`,
      '&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active': {
        backgroundColor: lighten(theme.palette[color].main, 0.84),
      }
    }),
    ...(color && skin === 'filled' && {
      backgroundColor: `var(--mui-palette-${color}-main)`,
      color: `var(--mui-palette-${color}-contrastText)`,
      '&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active': {
        backgroundColor: `var(--mui-palette-${color}-main)`,
      }
    })
  }
})

const IconButtonWrapper = forwardRef((props, ref) => {
  const { color, skin = 'filled', ...rest } = props

  return <CustomIconButton ref={ref} color={color} skin={skin} {...rest} />
})

export default IconButtonWrapper
