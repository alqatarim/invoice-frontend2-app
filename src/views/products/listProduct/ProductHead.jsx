'use client';

import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import PageIconHeader from '@components/headers/PageIconHeader';
import HorizontalWithoutBorder from '@components/card-statistics/HorizontalWithoutBorder';

/**
 * ProductHead Component - Displays product statistics header
 */
const ProductHead = ({ productListData }) => {
  const productStats = useMemo(
    () =>
      (productListData || []).reduce(
        (acc, product) => {
          acc.totalProducts += 1;

          if (product.isDeleted) {
            acc.inactiveProducts += 1;
          } else {
            acc.activeProducts += 1;
          }

          acc.totalValue += Number(product.sellingPrice) || 0;

          return acc;
        },
        {
          totalProducts: 0,
          activeProducts: 0,
          inactiveProducts: 0,
          totalValue: 0,
        }
      ),
    [productListData]
  );

  const statCards = useMemo(
    () => [
      {
        title: 'Total Products',
        value: productStats.totalProducts,
        icon: 'mdi:package-variant',
        color: 'primary',
      },
      {
        title: 'Active Products',
        value: productStats.activeProducts,
        subtitle: `${Math.round((productStats.activeProducts / Math.max(productStats.totalProducts, 1)) * 100)}%`,
        icon: 'mdi:check-circle',
        color: 'success',
      },
      {
        title: 'Inactive Products',
        value: productStats.inactiveProducts,
        subtitle: `${Math.round((productStats.inactiveProducts / Math.max(productStats.totalProducts, 1)) * 100)}%`,
        icon: 'mdi:close-circle',
        color: 'error',
      },
      // {
      //   title: 'Total Value',
      //   value: productStats.totalValue,
      //   subtitle: 'Selling Price',
      //   icon: 'hugeicons:saudi-riyal',
      //   color: 'info',
      // },
    ],
    [productStats]
  );

  return (
    <>
      <PageIconHeader title='Products' iconSize={30} icon='mdi:package-variant' />

      <div className="mb-2">
        <Grid container className='flex flex-wrap justify-between gap-0'>
          {statCards.map(card => (
            <Grid key={card.title}>
              <HorizontalWithoutBorder {...card} />
            </Grid>
          ))}
        </Grid>
      </div>
    </>
  );
};

export default ProductHead;