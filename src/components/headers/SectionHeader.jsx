'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import CustomAvatar from '@core/components/mui/Avatar';
import { Icon } from '@iconify/react';
const VALID_AVATAR_COLORS = new Set([
  'primary',
  'secondary',
  'error',
  'warning',
  'info',
  'success',
]);

/**
 * Section title row with a themed icon avatar (matches customer Address & Billing cards).
 *
 * @param {string} title - Section label
 * @param {string} icon - Remix icon class, e.g. `ri-map-pin-line`
 * @param {'primary'|'secondary'|'error'|'warning'|'info'|'success'} [color='primary'] - Avatar palette color
 * @param {'rounded'|'circular'|'square'} [avatarVariant='rounded']
 * @param {'light'|'lightish'|'light-static'|'filled'} [avatarSkin='light']
 * @param {number} [avatarSize=40]
 * @param {string} [titleVariant='h6'] - MUI Typography variant for the title
 * @param {string} [description] - Optional subtitle under the title
 * @param {React.ReactNode} [action] - Optional trailing control (e.g. Edit button)
 * @param {string} [className] - Outer wrapper classes (spacing, layout, etc.)
 * @param {string} [iconClassName] - Extra classes on the icon element
 * @param {number} [iconWidth=24] - Icon size in px (`fontSize` for Remix/CSS icons, `width`/`height` for Iconify SVGs)
 * @param {import('@mui/material').BoxProps['sx']} [sx] - MUI `sx` styles on the outer wrapper
 */

const SectionHeader = ({
  title,
  icon,
  color = 'primary',
  avatarVariant = 'rounded',
  avatarSkin = 'light',
  avatarSize = 40,
  titleVariant = 'h6',
  description,
  action,
  iconWidth = 24,
  className = '',
  iconClassName = '',
  sx,
  ...rest
}) => {
  const avatarColor = VALID_AVATAR_COLORS.has(color) ? color : 'primary';

  return (
    <Box className={className} sx={sx} {...rest}>
      <Box
        className={['flex w-full items-center', action ? 'justify-between gap-3' : '']
          .filter(Boolean)
          .join(' ')}
      >
        <Box className="flex items-center gap-3 min-w-0">
          <CustomAvatar
            variant={avatarVariant}
            skin={avatarSkin}
            color={avatarColor}
            size={avatarSize}
          >
            <Icon
              icon={icon}
              width={iconWidth}
              height={iconWidth}
              fontSize={iconWidth}
              style={{ fontSize: iconWidth, width: iconWidth, height: iconWidth }}
              className={[icon, iconClassName].filter(Boolean).join(' ')}
            />
          </CustomAvatar>
          <Box className="min-w-0">
            <Typography variant={titleVariant} className="font-semibold">
              {title}
            </Typography>
            {description ? (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            ) : null}
          </Box>
        </Box>
        {action ? <Box className="shrink-0">{action}</Box> : null}
      </Box>
    </Box>
  );
};

export default SectionHeader;
