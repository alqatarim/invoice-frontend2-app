import React from 'react';
import { Avatar, Box, Typography } from '@mui/material';
import { Icon } from '@iconify/react';

const AccountingPageHeader = ({ icon = 'tabler:calculator', title, description }) => {
  return (
    <Box className='flex items-start gap-3'>
      <Avatar className='bg-primary/12 text-primary bg-primaryLight w-12 h-12'>
        <Icon icon={icon} fontSize={24} />
      </Avatar>
      <Box>
        <Typography variant='h5' className='font-semibold text-primary'>
          {title}
        </Typography>
        {description ? (
          <Typography variant='body2' color='text.secondary'>
            {description}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
};

export default AccountingPageHeader;
