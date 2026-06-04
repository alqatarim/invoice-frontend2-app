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
 * @param {string} [className] - Root wrapper classes (spacing, etc.)
 * @param {string} [iconClassName] - Extra classes on the icon element
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
  className = '',
  iconClassName = '',
}) => {
  const avatarColor = VALID_AVATAR_COLORS.has(color) ? color : 'primary';

  return (
    <Box
      className={['flex items-center', action ? 'justify-between gap-3' : '', className]
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
            width={24}
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
  );
};

export default SectionHeader;
