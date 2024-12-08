'use client';

import React from 'react';
import AddPurchaseOrder from '@/views/purchase-orders/addOrder/AddPurchaseOrder';
import { addPurchaseOrder } from '@/app/(dashboard)/purchase-orders/actions';

const AddPurchaseOrderIndex = ({ vendors, products, taxRates, banks, signatures }) => {
  const handleSave = async (orderData) => {
    const response = await addPurchaseOrder(orderData);
    return response;
  };

  const dropdownData = {
    vendors,
    products,
    taxRates,
    banks,
    signatures
  };

  return (
    <AddPurchaseOrder
      onSave={handleSave}
      vendors={vendors}
      products={products}
      taxRates={taxRates}
      banks={banks}
      signatures={signatures}
    />
  );
};

export default AddPurchaseOrderIndex;