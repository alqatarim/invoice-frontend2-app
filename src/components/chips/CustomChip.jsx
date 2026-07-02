'use client';

import React from 'react';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';

const CORNER_RADIUS = {
  corner: theme => theme.shape.customBorderRadius?.sm ?? 4,
};

const FONT_SKIN_FALLBACKS = {
  dark: ['dark', 'main'],
  darker: ['darker', 'dark', 'main'],
  darkest: ['darkest', 'darker', 'dark', 'main'],
};

const SKIN_FALLBACKS = {
  light: ['lightOpacity', 'main'],
  lighter: ['lighterOpacity', 'light', 'main'],
  lightest: ['lightestOpacity', 'lighterOpacity', 'lightOpacity', 'main'],
};

const resolvePaletteValue = (theme, color, skin, fallbackMap) => {
  const colorPalette = theme.palette[color];
  const skinFallbacks = fallbackMap[skin];

  if (!colorPalette || !skinFallbacks) {
    return undefined;
  }

  return skinFallbacks.map(skinKey => colorPalette[skinKey]).find(Boolean);
};

const getFontSkinColor = (theme, color, fontSkin) => {
  return resolvePaletteValue(theme, color, fontSkin, FONT_SKIN_FALLBACKS);
};

const StyledChip = styled(Chip, {
  shouldForwardProp: prop => !['corners', 'fontSkin', 'fontskin', 'skin'].includes(prop),
})(({ theme, color, corners, fontSkin, skin }) => {
  const resolveRadius = CORNER_RADIUS[corners];
  const radius = resolveRadius?.(theme);
  const colorPalette = theme.palette[color];
  const fontSkinColor = getFontSkinColor(theme, color, fontSkin);
  const skinColor = resolvePaletteValue(theme, color, skin, SKIN_FALLBACKS);
  const defaultSkinFontColor = skinColor && !fontSkinColor ? colorPalette?.main : undefined;
  const resolvedFontColor = fontSkinColor || defaultSkinFontColor;

  return {
    ...(radius && { borderRadius: radius }),
    ...(skinColor && {
      '&.MuiChip-root': {
        backgroundColor: skinColor,
        '&:hover, &.MuiChip-clickable:hover': {
          backgroundColor: skinColor,
        },
      },
    }),

    ...(resolvedFontColor && {
      '&.MuiChip-root': {
        color: resolvedFontColor,
        '& .MuiChip-label': {
          color: resolvedFontColor,
        },
        '& .MuiChip-icon': {
          color: resolvedFontColor,
        },
        '& .MuiChip-deleteIcon': {
          color: resolvedFontColor,
        },
      },
    }),
  };
});

/**
 * MUI Chip wrapper with configurable corner shape.
 *
 * @param {'round'|'corner'} [corners='round'] - `round` keeps the default MUI chip radius (pill). `corner` uses `shape.customBorderRadius.sm` (4px).
 * @param {'default'|'normal'|'light'|'lighter'|'lightest'} [skin='default'] - Optional background color skin based on the selected MUI `color` palette.
 * @param {'default'|'normal'|'dark'|'darker'|'darkest'} [fontSkin] - Optional text color skin. Omit it, or pass `default`/`normal`, to use the chip palette `main` color when a light skin is applied.
 * @param {import('@mui/material/Chip').ChipProps} props - All standard MUI Chip props (label, color, size, variant, icon, onDelete, sx, etc.)
 */
const CustomChip = React.forwardRef(function CustomChip({ corners = 'round', skin = 'default', fontSkin, fontskin, ...props }, ref) {
  const normalizedCorners = corners === 'corner' ? 'corner' : 'round';
  const normalizedSkin = skin === 'lisghtest' ? 'lightest' : skin;
  const resolvedSkin = ['light', 'lighter', 'lightest'].includes(normalizedSkin) ? normalizedSkin : 'default';
  const requestedFontSkin = fontSkin ?? fontskin;
  const normalizedFontSkin = ['dark', 'darker', 'darkest'].includes(requestedFontSkin) ? requestedFontSkin : undefined;

  return (
    <StyledChip
      ref={ref}
      corners={normalizedCorners}
      skin={resolvedSkin}
      {...(normalizedFontSkin ? { fontSkin: normalizedFontSkin } : {})}
      {...props}
    />
  );
});

CustomChip.displayName = 'CustomChip';

export default CustomChip;
