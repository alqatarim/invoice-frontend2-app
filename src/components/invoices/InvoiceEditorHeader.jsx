'use client';

import React from 'react';
import { Tab, Tabs, Typography } from '@mui/material';
import { Icon } from '@iconify/react';

const InvoiceEditorHeader = ({ controller }) => (
  <div className='mb-5 flex items-center justify-between'>
    <div className='flex items-center gap-2'>
      <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primaryLight text-primary'>
        <Icon icon='tabler:file-invoice' fontSize={26} />
      </div>
      <Typography variant='h5' className='font-semibold text-primary'>
        {controller.title}
      </Typography>
    </div>

    <Tabs
      value={controller.posMode ? 'pos' : 'invoice'}
      onChange={(_, value) => controller.handleModeChange(value)}
      textColor='primary'
      indicatorColor='primary'
    >
      <Tab value='pos' label='POS' />
      <Tab value='invoice' label='Invoice' />
    </Tabs>
  </div>
);

export default InvoiceEditorHeader;
