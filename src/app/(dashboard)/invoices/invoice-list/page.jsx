// app/invoices/page.jsx

import React from 'react';
import InvoiceList from '@/views/invoices/invoiceList/InvoiceList';
import ProtectedComponent from '@/components/ProtectedComponent'


/**
 * InvoicesPage Component
 * Simply renders the InvoiceList component.
 *
 * @returns JSX.Element
 */
const InvoicesPage = () => {

    return (

      <ProtectedComponent>
        <InvoiceList />
      </ProtectedComponent>


    )
};

export default InvoicesPage;
