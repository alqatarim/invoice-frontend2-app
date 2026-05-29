'use client';

import React from 'react';
import InvoicePosLikeForm from '@/views/invoices/invoice';

const AddInvoice = ({
  controller,
  customersData = [],
  productData = [],
}) => {
  return (
    <InvoicePosLikeForm
      controller={controller}
      customersData={customersData}
      productData={productData}
      resetOnCompleteClose
    />
  );
};

export default AddInvoice;
