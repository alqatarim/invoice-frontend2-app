'use client';

import React from 'react';
import Link from 'next/link';
import { Button, ButtonGroup } from '@mui/material';
import { productNavigationTabs } from '@/data/dataSets';

const ProductNavigationButtons = ({ activeTab = 'products' }) => (
  <div className='flex justify-center mt-6 mb-3'>
    <ButtonGroup
      variant='outlined'
      size='medium'
      color='primary'
      sx={{ '& .MuiButton-root': { width: 120 } }}
    >
      {productNavigationTabs.map(tab => {
        const isActive = tab.key === activeTab;

        return (
          <Button
            key={tab.key}
            variant={isActive ? 'contained' : 'outlined'}
            {...(!isActive ? { component: Link, href: tab.href } : {})}
          >
            {tab.label}
          </Button>
        );
      })}
    </ButtonGroup>
  </div>
);

export default ProductNavigationButtons;
