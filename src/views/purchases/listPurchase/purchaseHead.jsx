'use client';

import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import PageIconHeader from '@components/headers/PageIconHeader';
import HorizontalWithoutBorder from '@components/card-statistics/HorizontalWithoutBorder';

/**
 * PurchaseHead Component - Displays purchase statistics header
 */
const PurchaseHead = ({ purchaseListData }) => {
  const purchaseStats = useMemo(() => {
    const stats = (purchaseListData || []).reduce(
      (accumulator, purchase) => {
        accumulator.totalPurchases += 1;
        accumulator.totalAmount += Number(purchase.TotalAmount) || 0;
        accumulator.activePurchases += 1;

        return accumulator;
      },
      {
        totalPurchases: 0,
        totalAmount: 0,
        activePurchases: 0,
      }
    );

    return {
      ...stats,
      avgPurchaseValue: stats.totalPurchases > 0 ? stats.totalAmount / stats.totalPurchases : 0,
    };
  }, [purchaseListData]);

  const statCards = useMemo(
    () => [
      {
        title: 'Total Purchases',
        value: purchaseStats.totalPurchases,
        subtitle: `${purchaseStats.activePurchases} active`,
        icon: 'tabler:shopping-cart',
        color: 'primary',
      },
      {
        title: 'Active Purchases',
        value: purchaseStats.activePurchases,
        subtitle: `${Math.round((purchaseStats.activePurchases / Math.max(purchaseStats.totalPurchases, 1)) * 100)}%`,
        icon: 'mdi:check-circle-outline',
        color: 'success',
      },
      {
        title: 'Total Amount',
        value: purchaseStats.totalAmount,
        subtitle: 'Total Value',
        icon: 'hugeicons:saudi-riyal',
        color: 'info',
        isCurrency: true,
      },
      {
        title: 'Average Value',
        value: purchaseStats.avgPurchaseValue,
        subtitle: 'Avg Purchase',
        icon: 'mdi:chart-line',
        color: 'warning',
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