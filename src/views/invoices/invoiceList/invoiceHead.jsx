'use client';

import React, { useMemo } from 'react';
import PageIconHeader from '@components/headers/PageIconHeader';
import StatCardGrid from '@/components/shared/StatCardGrid';

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
        icon: 'iconamoon:invoice',
        color: 'primary',
        isCurrency: true,
      },
      {
        title: 'Outstanding',
        value: cardCounts.totalOutstanding?.total_sum || 0,
        icon: 'mdi:access-time',
        color: 'warning',
        isCurrency: true,
      },
      {
        title: 'Total Overdue',
        value: cardCounts.totalOverdue?.total_sum || 0,
        icon: 'mdi:clock-alert-outline',
        color: 'error',
        isCurrency: true,
      },
      {
        title: 'Drafts',
        value: cardCounts.totalDrafted?.total_sum || 0,
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
      <StatCardGrid cards={statCards} />
    </>
  );
};

export default InvoiceHead;
