'use client';

import React from 'react';
import Link from 'next/link';
import { Button, ButtonGroup } from '@mui/material';

const navigationTabs = [
  { key: 'products', label: 'Products', href: '/products/product-list' },
  { key: 'categories', label: 'Categories', href: '/categories/category-list' },
  { key: 'units', label: 'Units', href: '/units/unit-list' },
];

const ProductNavigationButtons = ({ activeTab = 'products' }) => (
  <div className='flex justify-center mt-6 mb-3'>
    <ButtonGroup
      variant='outlined'
      size='medium'
      color='primary'
      sx={{ '& .MuiButton-root': { width: 120 } }}
    >
      {navigationTabs.map(tab => {
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
