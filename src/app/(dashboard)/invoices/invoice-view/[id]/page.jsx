import React from 'react';

import { getInvoiceById } from '@/app/(dashboard)/invoices/actions';
// import { getInvoiceForEditing } from '../actions';
import InvoiceView from '@/views/invoices/viewInvoice/index';
import ProtectedComponent from '@/components/ProtectedComponent';

/**
 * InvoiceViewPage Component
 * Server-side component to fetch invoice data and render the ViewInvoice client component.
 *
 * @param {Object} params - Dynamic route parameters.
 * @param {string} params.id - Invoice ID from the URL.
 * @returns JSX.Element
 */
const InvoiceViewPage = async ({ params }) => {
  const { id } = params;

  try {
    const invoiceData = await getInvoiceById(id);

    if (!invoiceData) {
      notFound();
    }

    return (
      <ProtectedComponent>
        <InvoiceView initialInvoiceData={invoiceData} />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('Error loading invoice data:', error);
    notFound();
  }
}

export default InvoiceViewPage;
