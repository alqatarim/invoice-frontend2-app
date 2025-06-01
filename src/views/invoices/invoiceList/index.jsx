'use client'

import React from "react";
import InvoiceList from "@/views/invoices/invoiceList/InvoiceList";

const InvoiceListIndex = ({ initialData, initialCustomers }) => {
  // Only extract and pass initial data as props
  const initialInvoices = initialData?.invoices || [];
  const pagination = initialData?.pagination || {
    current: 1,
    pageSize: 10,
    total: 0
  };
  const cardCounts = initialData?.cardCounts || {};

  return (
    <InvoiceList
      initialInvoices={initialInvoices}
      pagination={pagination}
      cardCounts={cardCounts}
      initialCustomers={initialCustomers || []}
      // Pass other initial data if needed
    />
  );
};

export default InvoiceListIndex;