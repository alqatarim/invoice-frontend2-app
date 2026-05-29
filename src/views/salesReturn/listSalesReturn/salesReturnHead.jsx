'use client';

import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import PageIconHeader from '@components/headers/PageIconHeader';
import HorizontalWithoutBorder from '@components/card-statistics/HorizontalWithoutBorder';

const SalesReturnHead = ({ salesReturnListData }) => {
  const cardCounts = useMemo(
    () => ({
      totalSalesReturns: salesReturnListData?.totalSalesReturns || 0,
      totalRefundAmount: salesReturnListData?.totalRefundAmount || 0,
      totalVat: salesReturnListData?.totalVat || 0,
      totalDiscount: salesReturnListData?.totalDiscount || 0,
    }),
    [salesReturnListData]
  );

  const statCards = useMemo(
    () => [
      {
        title: 'Total Refunded',
        value: cardCounts.totalRefundAmount,
        icon: 'mdi:cash-refund',
        color: 'error',
        isCurrency: true,
      },
      {
        title: 'Sales Returns',
        value: cardCounts.totalSalesReturns,
        icon: 'mdi:invoice-export-outline',
        color: 'primary',
      },
      {
        title: 'VAT',
        value: cardCounts.totalVat,
        icon: 'mdi:receipt-text-outline',
        color: 'warning',
        isCurrency: true,
      },
      {
        title: 'Discounts',
        value: cardCounts.totalDiscount,
        icon: 'mdi:tag-minus-outline',
        color: 'info',
        isCurrency: true,
      },
    ],
    [cardCounts]
  );

  return (
    <>
      <PageIconHeader title='Sales Returns' icon='mdi:invoice-export-outline' />

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

export default SalesReturnHead;
