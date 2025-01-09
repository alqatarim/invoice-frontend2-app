'use client'
import MuiButton from '@mui/material/Button'
import { styled } from '@mui/material/styles'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Styled Component with $fullColor to handle custom color variants
const CustomIconButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== '$fullColor' // Prevent $fullColor from being passed to the DOM
})(({ $fullColor, size, theme, variant }) => {
  // Helper function to extract color from theme based on $fullColor
  const getColorFromTheme = () => {
    if (!$fullColor || !$fullColor.includes('.')) return null
    const [palette, shade] = $fullColor.split('.')
    return theme.palette[palette]?.[shade] || null
  }

  const colorValue = getColorFromTheme()

  return {
    minInlineSize: 0,
    // Size-based styling
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
    // Color-based styling
    ...(colorValue
      ? {
          color: colorValue,
          '&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active': {
            backgroundColor: `${colorValue}14` // Adjust opacity as needed
          }
        }
      : {
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
  }
})

// Wrapper Component to handle color prop and separate fullColor
const IconButtonWrapper = ({ color, ...props }) => {
  // Extract base color (e.g., 'primary' from 'primary.light')
  const baseColor = color && color.includes('.') ? color.split('.')[0] : color
  return <CustomIconButton {...props} color={baseColor} $fullColor={color} />
}

export default IconButtonWrapper
