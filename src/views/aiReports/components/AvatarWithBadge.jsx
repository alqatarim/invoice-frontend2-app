'use client';

import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';

import CustomAvatar from '@core/components/mui/Avatar';
import { getInitials } from '@/utils/getInitials';
import { Icon } from '@iconify/react';
const BadgeContentSpan = styled('span', {
  shouldForwardProp: (prop) => prop !== 'badgeSize',
})(({ color, badgeSize }) => ({
  width: badgeSize,
  height: badgeSize,
  borderRadius: '50%',
  backgroundColor: `var(--mui-palette-${color}-main)`,
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)',
}));

const AvatarWithBadge = ({
  alt = '',
  src,
  color = 'primary',
  badgeColor = 'success',
  isChatActive = false,
  onClick,
  className,
  badgeSize = 8,
  icon,
  size = 40,
}) => (
  <Badge
    overlap='circular'
    badgeContent={<BadgeContentSpan color={badgeColor} badgeSize={badgeSize} />}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
  >
    {src ? (
      <Avatar
        alt={alt}
        src={src}
        onClick={onClick}
        className={className}
        sx={{ width: size, height: size, cursor: onClick ? 'pointer' : 'default' }}
      />
    ) : (
      <CustomAvatar
        color={color}
        skin={isChatActive ? 'light-static' : 'light'}
        size={size}
        onClick={onClick}
        className={className}
      // icon={icon ? <Icon icon={icon} /> : undefined}
      >
        <Icon icon={icon} width={24} />
      </CustomAvatar>
    )}
  </Badge>
);

export default AvatarWithBadge;
