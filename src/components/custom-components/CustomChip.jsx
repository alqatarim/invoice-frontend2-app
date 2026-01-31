'use client'

import React from 'react'
import { Chip } from '@mui/material'
import { styled } from '@mui/material/styles'

/**
 * Custom Chip component with additional props:
 * @param {string} rounded - Controls border radius: 'default', 'less', 'minimal', 'none'
 * @param {string} colorVariant - Accepts MUI color variants like 'success.dark', 'error.light', etc.
 * @param {string} size - Extended sizes: 'xs', 'sm', 'small', 'md', 'medium', 'lg', 'large', 'xl', 'xlarge'
 * @param {...other} other - All other MUI Chip props
 */

const StyledChip = styled(Chip, {
  shouldForwardProp: (prop) => !['rounded', 'colorVariant', 'chipCustomSize'].includes(prop),
})(({ theme, rounded, colorVariant, chipCustomSize }) => {
  // Handle border radius
  const getBorderRadius = () => {
    switch (rounded) {
      case 'none':
        return '0px'
      case 'minimal':
        return '2px'
      case 'less':
        return '6px'
      case 'default':
      default:
        return theme.shape.borderRadius * 4 // MUI default for chips
    }
  }

  // Handle custom sizes
  const getSizeStyles = () => {
    const baseStyles = {
      xs: {
        height: '20px !important',
        fontSize: '0.625rem !important',
        padding: '0 4px !important',
        '& .MuiChip-label': {
          padding: '0 4px !important',
          fontSize: '0.625rem !important',
        },
        '& .MuiChip-icon': {
          fontSize: '0.75rem !important',
          marginLeft: '2px !important',
          marginRight: '-2px !important',
        },
        '& .MuiChip-deleteIcon': {
          fontSize: '0.75rem !important',
          marginRight: '2px !important',
          marginLeft: '-2px !important',
        }
      },
      sm: {
        height: '24px !important',
        fontSize: '0.75rem !important',
        padding: '0 6px !important',
        '& .MuiChip-label': {
          padding: '0 6px !important',
          fontSize: '0.75rem !important',
        },
        '& .MuiChip-icon': {
          fontSize: '0.875rem !important',
          marginLeft: '3px !important',
          marginRight: '-3px !important',
        },
        '& .MuiChip-deleteIcon': {
          fontSize: '0.875rem !important',
          marginRight: '3px !important',
          marginLeft: '-3px !important',
        }
      },
      small: {
        // MUI default small
      },
      md: {
        height: '36px !important',
        fontSize: '0.875rem !important',
        padding: '0 10px !important',
        '& .MuiChip-label': {
          padding: '0 10px !important',
          fontSize: '0.875rem !important',
        },
        '& .MuiChip-icon': {
          fontSize: '1rem !important',
          marginLeft: '5px !important',
          marginRight: '-5px !important',
        },
        '& .MuiChip-deleteIcon': {
          fontSize: '1rem !important',
          marginRight: '5px !important',
          marginLeft: '-5px !important',
        }
      },
      medium: {
        // MUI default medium
      },
      lg: {
        height: '40px !important',
        fontSize: '1rem !important',
        padding: '0 12px !important',
        '& .MuiChip-label': {
          padding: '0 12px !important',
          fontSize: '1rem !important',
        },
        '& .MuiChip-icon': {
          fontSize: '1.125rem !important',
          marginLeft: '6px !important',
          marginRight: '-6px !important',
        },
        '& .MuiChip-deleteIcon': {
          fontSize: '1.125rem !important',
          marginRight: '6px !important',
          marginLeft: '-6px !important',
        }
      },
      large: {
        height: '44px !important',
        fontSize: '1.125rem !important',
        padding: '0 14px !important',
        '& .MuiChip-label': {
          padding: '0 14px !important',
          fontSize: '1.125rem !important',
        },
        '& .MuiChip-icon': {
          fontSize: '1.25rem !important',
          marginLeft: '7px !important',
          marginRight: '-7px !important',
        },
        '& .MuiChip-deleteIcon': {
          fontSize: '1.25rem !important',
          marginRight: '7px !important',
          marginLeft: '-7px !important',
        }
      },
      xl: {
        height: '48px !important',
        fontSize: '1.25rem !important',
        padding: '0 16px !important',
        '& .MuiChip-label': {
          padding: '0 16px !important',
          fontSize: '1.25rem !important',
        },
        '& .MuiChip-icon': {
          fontSize: '1.375rem !important',
          marginLeft: '8px !important',
          marginRight: '-8px !important',
        },
        '& .MuiChip-deleteIcon': {
          fontSize: '1.375rem !important',
          marginRight: '8px !important',
          marginLeft: '-8px !important',
        }
      },
      xlarge: {
        height: '52px !important',
        fontSize: '1.375rem !important',
        padding: '0 18px !important',
        '& .MuiChip-label': {
          padding: '0 18px !important',
          fontSize: '1.375rem !important',
        },
        '& .MuiChip-icon': {
          fontSize: '1.5rem !important',
          marginLeft: '9px !important',
          marginRight: '-9px !important',
        },
        '& .MuiChip-deleteIcon': {
          fontSize: '1.5rem !important',
          marginRight: '9px !important',
          marginLeft: '-9px !important',
        }
      }
    }

    return baseStyles[chipCustomSize] || {}
  }

  // Handle color variants
  const getColorStyles = () => {
    if (!colorVariant || !colorVariant.includes('.')) {
      return {}
    }

    const [colorName, variant] = colorVariant.split('.')
    const colorPath = `${colorName}.${variant}`

    // Get the color from theme palette
    const getColorFromPath = (path) => {
      return path.split('.').reduce((obj, key) => obj?.[key], theme.palette)
    }

    const color = getColorFromPath(colorPath)

    if (!color) {
      console.warn(`Color variant "${colorVariant}" not found in theme palette`)
      return {}
    }

    // Determine text color based on variant (following MUI chip tonal pattern)
    const getTextColor = () => {
      const paletteColor = theme.palette[colorName]

      // For lighter/lightest backgrounds: use the dark or main color of that palette
      if (variant === 'lighter' || variant === 'lightest' || variant === 'lightestOpacity' || variant === 'lighterOpacity') {
        return paletteColor?.dark || paletteColor?.main || theme.palette.getContrastText(color)
      }

      // For darker/darkest backgrounds: use white (like MUI's contrastText)
      if (variant === 'darker' || variant === 'darkest' || variant === 'darkerOpacity' || variant === 'darkestOpacity') {
        return paletteColor?.contrastText || '#fff'
      }

      // For light variant: use dark color of that palette
      if (variant === 'light' || variant === 'lightOpacity') {
        return paletteColor?.dark || theme.palette.getContrastText(color)
      }

      // For dark variant: use white
      if (variant === 'dark' || variant === 'darkOpacity') {
        return paletteColor?.contrastText || '#fff'
      }

      // For main or other variants: use standard contrast calculation
      return paletteColor?.contrastText || theme.palette.getContrastText(color)
    }

    return {
      backgroundColor: color,
      color: getTextColor(),
      '&:hover': {
        backgroundColor: color,
        opacity: 0.8,
      },
      '&.MuiChip-clickable:hover': {
        backgroundColor: color,
        opacity: 0.8,
      }
    }
  }

  return {
    borderRadius: getBorderRadius(),
    ...getSizeStyles(),
    ...getColorStyles(),
  }
})

const CustomChip = React.forwardRef(({
  rounded = 'default',
  colorVariant,
  size = 'medium',
  ...props
}, ref) => {
  // Handle size mapping for MUI compatibility
  const getMuiSize = () => {
    const sizeMapping = {
      xs: 'small',
      sm: 'small',
      small: 'small',
      md: 'medium',
      medium: 'medium',
      lg: 'medium',
      large: 'medium',
      xl: 'medium',
      xlarge: 'medium'
    }
    return sizeMapping[size] || 'medium'
  }

  return (
    <StyledChip
      ref={ref}
      size={getMuiSize()}
      rounded={rounded}
      colorVariant={colorVariant}
      chipCustomSize={size}
      {...props}
    />
  )
})

CustomChip.displayName = 'CustomChip'

export default CustomChip