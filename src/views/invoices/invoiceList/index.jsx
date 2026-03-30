'use client';

import React from 'react';
import InvoiceList from './InvoiceList';

const InvoiceListIndex = ({ initialListData, initialCustomersData = [] }) => {
  const initialInvoices = initialListData?.invoices || [];
  const pagination = initialListData?.pagination || {
    current: 1,
    pageSize: 10,
    total: 0,
  };
  const cardCounts = initialListData?.cardCounts || {};

  return (
    <InvoiceList
      initialInvoices={initialInvoices}
      initialPagination={pagination}
      initialCardCounts={cardCounts}
      initialCustomers={initialCustomersData}
    />
  );
};

export default InvoiceListIndex;
