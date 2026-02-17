// app/invoices/page.jsx

import React from 'react';
import InvoiceListIndex from '@/views/invoices/invoiceList/index';
import { getInitialInvoiceData } from '@/app/(dashboard)/invoices/actions';

/**
 * InvoicesPage Component
 * Fetches initial invoice data on the server and passes it to the client component.
 *
 * @returns JSX.Element
 */
const InvoicesPage = async () => {
  // Fetch only critical list data for faster first render.
  const initialData = await getInitialInvoiceData();

  return (
    <InvoiceListIndex
      initialData={initialData}
      initialCustomers={[]}
    />
  );
};

export default InvoicesPage;
