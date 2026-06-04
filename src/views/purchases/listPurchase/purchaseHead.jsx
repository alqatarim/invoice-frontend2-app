'use client';

import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import PageIconHeader from '@components/headers/PageIconHeader';
import HorizontalWithoutBorder from '@components/card-statistics/HorizontalWithoutBorder';

/**
 * PurchaseHead Component - Displays purchase statistics header
 */
const PurchaseHead = ({ summary = {} }) => {
  const purchaseStats = useMemo(() => {
    const totalPurchases = Number(summary.totalPurchases || 0);
    const totalAmount = Number(summary.totalPurchaseAmount || 0);

    return {
      totalPurchases,
      totalAmount,
    };
  }, [summary]);

  const statCards = useMemo(
    () => [
      {
        title: 'Total Purchases',
        value: purchaseStats.totalAmount,
        subtitle: `${purchaseStats.totalPurchases} ${purchaseStats.totalPurchases === 1 ? 'purchase' : 'purchases'}`,
        icon: 'tabler:shopping-cart',
        color: 'primary',
        isCurrency: true,
      },
    ],
    [purchaseStats]
  );

  return (
    <>
      <PageIconHeader title='Purchases' icon='tabler:shopping-cart' />

      <div className="mb-2">
        <Grid container className='flex flex-wrap justify-between gap-0'>
          {statCards.map((card) => (
            <Grid key={card.title}>
              <HorizontalWithoutBorder {...card} />
            </Grid>
          ))}
        </Grid>
      </div>
    </>
  );
};

export default PurchaseHead;
