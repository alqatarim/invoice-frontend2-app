'use client';

import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import PageIconHeader from '@components/headers/PageIconHeader';
import HorizontalWithoutBorder from '@components/card-statistics/HorizontalWithoutBorder';
import { purchaseReturnStatuses } from '@/data/dataSets';

const DebitNoteHead = ({ summary = {} }) => {
  const cardCounts = useMemo(
    () => ({
      totalReturnAmount: summary.totalReturnAmount || 0,
      pending: summary.pending || { amount: 0, count: 0 },
      paid: summary.paid || { amount: 0, count: 0 },
      draft: summary.draft || { amount: 0, count: 0 },
    }),
    [summary]
  );

  const statCards = useMemo(
    () => [
      {
        title: 'Total Returns',
        value: cardCounts.totalReturnAmount,
        icon: 'mdi:cash-refund',
        color: 'primary',
        isCurrency: true,
      },
      ...purchaseReturnStatuses.map(status => ({
        title: status.label,
        value: cardCounts[status.summaryKey]?.amount || 0,
        subtitle: `${cardCounts[status.summaryKey]?.count || 0} returns`,
        icon: status.icon,
        color: status.color,
        isCurrency: true,
      })),
    ],
    [cardCounts]
  );

  return (
    <>
      <PageIconHeader title="Purchase Returns" icon="tabler:receipt-refund" />

      <div className="mb-2">
        <Grid container className="flex flex-wrap justify-between gap-0">
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

export default DebitNoteHead;
