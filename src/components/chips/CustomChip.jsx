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
  shouldForwardProp: prop => prop !== 'corners' && prop !== 'fontSkin' && prop !== 'skin',
})(({ theme, color, corners, fontSkin, skin }) => {
  const resolveRadius = CORNER_RADIUS[corners];
  const radius = resolveRadius?.(theme);
  const fontSkinColor = getFontSkinColor(theme, color, fontSkin);
  const skinColor = resolvePaletteValue(theme, color, skin, SKIN_FALLBACKS);

  return {
    ...(radius && { borderRadius: radius }),
    ...(skinColor && {
      backgroundColor: skinColor,
      '&:hover': {
        backgroundColor: skinColor,
      },
      '&.MuiChip-clickable:hover': {
        backgroundColor: skinColor,
      },
    }),
    ...(fontSkinColor && {
      color: fontSkinColor,
      '& .MuiChip-label': {
        color: fontSkinColor,
      },
      '& .MuiChip-icon': {
        color: fontSkinColor,
      },
      '& .MuiChip-deleteIcon': {
        color: fontSkinColor,
      },
    }),
  };
});

/**
 * MUI Chip wrapper with configurable corner shape.
 *
 * @param {'round'|'corner'} [corners='round'] - `round` keeps the default MUI chip radius (pill). `corner` uses `shape.customBorderRadius.sm` (4px).
 * @param {'default'|'normal'|'light'|'lighter'|'lightest'} [skin='default'] - Optional background color skin based on the selected MUI `color` palette.
 * @param {'default'|'normal'|'dark'|'darker'|'darkest'} [fontSkin='default'] - Optional text color skin based on the selected MUI `color` palette.
 * @param {import('@mui/material/Chip').ChipProps} props - All standard MUI Chip props (label, color, size, variant, icon, onDelete, sx, etc.)
 */
const CustomChip = React.forwardRef(function CustomChip({ corners = 'round', skin = 'default', fontSkin = 'default', ...props }, ref) {
  const normalizedCorners = corners === 'corner' ? 'corner' : 'round';
  const normalizedSkin = skin === 'lisghtest' ? 'lightest' : skin;
  const resolvedSkin = ['light', 'lighter', 'lightest'].includes(normalizedSkin) ? normalizedSkin : 'default';
  const normalizedFontSkin = ['dark', 'darker', 'darkest'].includes(fontSkin) ? fontSkin : 'default';

  return (
    <StyledChip
      ref={ref}
      corners={normalizedCorners}
      skin={resolvedSkin}
      fontSkin={normalizedFontSkin}
      {...props}
    />
  );
});

CustomChip.displayName = 'CustomChip';

export default CustomChip;
