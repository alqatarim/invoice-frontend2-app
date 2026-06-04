'use client';

import React from 'react';
import Quotation from '@/views/quotations/quotation';

const AddQuotation = ({
  controller,
  customersData = [],
  productData = [],
}) => (
  <Quotation
    controller={controller}
    customersData={customersData}
    productData={productData}
  />
);

export default AddQuotation;
