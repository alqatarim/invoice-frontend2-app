'use client';

import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import PageIconHeader from '@components/headers/PageIconHeader';
import HorizontalWithoutBorder from '@components/card-statistics/HorizontalWithoutBorder';
import { quotationStatusDefinitions } from '@/data/dataSets';

const formatCountSubtitle = (count, label) => `${count} ${count === 1 ? label : `${label}s`}`;

const QuotationHead = ({ summary = {} }) => {
  const cardCounts = useMemo(
    () => ({
      total: {
        count: Number(summary.totalQuotations || 0),
        amount: Number(summary.totalQuotationAmount || 0),
      },
      open: {
        count: Number(summary.open?.count ?? summary.openQuotations ?? 0),
        amount: Number(summary.open?.amount || 0),
      },
      converted: {
        count: Number(summary.converted?.count ?? summary.convertedQuotations ?? 0),
        amount: Number(summary.converted?.amount || 0),
      },
      expired: {
        count: Number(summary.expired?.count ?? summary.expiredQuotations ?? 0),
        amount: Number(summary.expired?.amount || 0),
      },
    }),
    [summary]
  );

  const statCards = useMemo(
    () => [
      {
        title: 'Total',
        value: cardCounts.total.amount || 0,
        subtitle: formatCountSubtitle(cardCounts.total.count || 0, 'quotes'),
        icon: 'tabler:file-analytics',
        color: 'primary',
        isCurrency: true,
      },
      ...quotationStatusDefinitions
        .filter(status => status.summaryKey)
        .map(status => ({
          title: status.label,
          value: cardCounts[status.summaryKey]?.amount || 0,
          subtitle: formatCountSubtitle(cardCounts[status.summaryKey]?.count || 0, 'quotes'),
          icon: status.icon,
          color: status.color,
          isCurrency: true,
        })),
    ],
    [cardCounts]
  );

  return (
    <>
      <PageIconHeader title="Quotations" icon="tabler:file-analytics" />

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

export default QuotationHead;
