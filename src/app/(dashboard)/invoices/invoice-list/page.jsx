// app/invoices/page.jsx

import React from 'react';
import InvoiceListIndex from '@/views/invoices/invoiceList/index';
import ProtectedComponent from '@/components/ProtectedComponent';
import { getInitialInvoiceData } from '@/app/(dashboard)/invoices/actions';

/**
 * InvoicesPage Component
 * Fetches initial invoice data on the server and passes it to the client component.
 *
 * @returns JSX.Element
 */
const InvoicesPage = async () => {
  // Fetch initial invoice data on the server
  const initialData = await getInitialInvoiceData();

  return (
    <ProtectedComponent>
      <InvoiceListIndex initialData={initialData} />
    </ProtectedComponent>
  );
};

export default InvoicesPage;
