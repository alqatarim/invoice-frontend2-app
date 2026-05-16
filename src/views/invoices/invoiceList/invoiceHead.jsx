'use client';

import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import PageIconHeader from '@components/headers/PageIconHeader';
import HorizontalWithoutBorder from '@components/card-statistics/HorizontalWithoutBorder';

/**
 * InvoiceHead Component - Displays invoice statistics header
 */
const InvoiceHead = ({ invoiceListData }) => {
  const cardCounts = useMemo(
    () => ({
      totalCancelled: invoiceListData?.total_cancelled?.[0] || {},
      totalOutstanding: invoiceListData?.total_outstanding?.[0] || {},
      totalOverdue: invoiceListData?.total_overdue?.[0] || {},
      totalInvoice: invoiceListData?.total_invoice?.[0] || {},
      totalDrafted: invoiceListData?.total_drafted?.[0] || {},
      recurringTotal: invoiceListData?.recurring_total?.[0] || {}
    }),
    [invoiceListData]
  );

  const statCards = useMemo(
    () => [
      {
        title: 'Total Invoiced',
        value: cardCounts.totalInvoice?.total_sum || 0,
        subtitle: `${cardCounts.totalInvoice?.count || 0} invoices`,
        icon: 'iconamoon:invoice',
        color: 'primary',
        isCurrency: true,
      },
      {
        title: 'Outstanding',
        value: cardCounts.totalOutstanding?.total_sum || 0,
        subtitle: `${cardCounts.totalOutstanding?.count || 0} outstanding`,
        icon: 'mdi:access-time',
        color: 'warning',
        isCurrency: true,
      },
      {
        title: 'Total Overdue',
        value: cardCounts.totalOverdue?.total_sum || 0,
        subtitle: `${cardCounts.totalOverdue?.count || 0} overdue`,
        icon: 'mdi:clock-alert-outline',
        color: 'error',
        isCurrency: true,
      },
      {
        title: 'Drafts',
        value: cardCounts.totalDrafted?.total_sum || 0,
        subtitle: `${cardCounts.totalDrafted?.count || 0} drafts`,
        icon: 'mdi:draw-pen',
        color: 'info',
        isCurrency: true,
      },
    ],
    [cardCounts]
  );

  return (
    <>
      <PageIconHeader title='Invoices' icon='tabler:file-invoice' />

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

export default InvoiceHead;