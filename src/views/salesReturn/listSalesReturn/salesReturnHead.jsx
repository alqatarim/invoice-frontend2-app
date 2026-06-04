'use client';

import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import PageIconHeader from '@components/headers/PageIconHeader';
import HorizontalWithoutBorder from '@components/card-statistics/HorizontalWithoutBorder';
import { salesReturnStatuses } from '@/data/dataSets';

const SalesReturnHead = ({ salesReturnListData }) => {
  const cardCounts = useMemo(
    () => ({
      totalRefundAmount: salesReturnListData?.totalRefundAmount || 0,
      pending: salesReturnListData?.pending || { amount: 0, count: 0 },
      paid: salesReturnListData?.paid || { amount: 0, count: 0 },
      draft: salesReturnListData?.draft || { amount: 0, count: 0 },
    }),
    [salesReturnListData]
  );

  const statCards = useMemo(
    () => {
      const totalReturns =
        (cardCounts.pending?.count || 0)
        + (cardCounts.paid?.count || 0)
        + (cardCounts.draft?.count || 0);

      return [
        {
          title: 'Total Refunds',
          value: cardCounts.totalRefundAmount,
          subtitle: `${totalReturns} ${totalReturns === 1 ? 'return' : 'returns'}`,
          icon: 'mdi:cash-refund',
          color: 'primary',
          isCurrency: true,
        },
        ...salesReturnStatuses.map((status) => ({
          title: status.label,
          value: cardCounts[status.summaryKey]?.amount || 0,
          subtitle: `${cardCounts[status.summaryKey]?.count || 0} returns`,
          icon: status.icon,
          color: status.color,
          isCurrency: true,
        })),
      ];
    },
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
