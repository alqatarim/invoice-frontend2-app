import React from 'react';
import { Avatar, Box, Typography } from '@mui/material';
import { Icon } from '@iconify/react';

const PageIconHeader = ({
  title,
  icon,
  description,
  className = 'mb-5',
  iconSize = 26,
  avatarClassName = 'bg-primary/12 text-primary bg-primaryLight w-10 h-10 sm:w-12 sm:h-12'
}) => {
  return (
    <Box className={`flex justify-start items-center ${className}`.trim()}>
      <Box className='flex items-center gap-2'>
        <Avatar className={avatarClassName}>
          <Icon icon={icon} fontSize={iconSize} />
        </Avatar>
        <Box>
          <Typography
            variant='h5'
            className='font-semibold text-primary'
            sx={{ typography: { xs: 'h6', sm: 'h5' } }}
          >
            {title}
          </Typography>
          {description ? (
            <Typography variant='body2' color='text.secondary'>
              {description}
            </Typography>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export default PageIconHeader;
