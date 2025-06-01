// app/invoices/page.jsx

import React from 'react';
import InvoiceListIndex from '@/views/invoices/invoiceList/index';
import ProtectedComponent from '@/components/ProtectedComponent';
import { getInitialInvoiceData, searchCustomers } from '@/app/(dashboard)/invoices/actions';

/**
 * InvoicesPage Component
 * Fetches initial invoice data on the server and passes it to the client component.
 *
 * @returns JSX.Element
 */
const InvoicesPage = async () => {
  // Fetch initial invoice data and customers separately on the server
  const [initialData, customers] = await Promise.all([
    getInitialInvoiceData(),
    searchCustomers('') // Get all customers by passing empty search term
  ]);

  return (
    <ProtectedComponent>
      <InvoiceListIndex 
        initialData={initialData} 
        initialCustomers={customers}
      />
    </ProtectedComponent>
  );
};

export default InvoicesPage;
