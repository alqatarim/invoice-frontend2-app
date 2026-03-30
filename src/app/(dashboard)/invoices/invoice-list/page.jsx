import React from 'react';
import InvoiceListIndex from '@/views/invoices/invoiceList';
import { getInvoiceListPageData } from './actions';

const InvoicesPage = async () => {
  try {
    const initialListData = await getInvoiceListPageData();

    return (
      <InvoiceListIndex
        initialListData={initialListData}
        initialCustomersData={[]}
      />
    );
  } catch (error) {
    console.error('Error loading invoice list:', error);
    return (
      <div className='p-8 text-red-600'>
        Failed to load invoices. Please refresh or try again later.
      </div>
    );
  }
};

export default InvoicesPage;
