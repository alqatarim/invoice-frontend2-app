'use client';

import React from 'react';
import InvoicePosLikeForm from '@/views/invoices/invoice';

const EditInvoice = ({
  controller,
  customersData = [],
  productData = [],
}) => {
  return (
    <InvoicePosLikeForm
      controller={controller}
      customersData={customersData}
      productData={productData}
      resetOnCompleteClose={false}
    />
  );
};

export default EditInvoice;
