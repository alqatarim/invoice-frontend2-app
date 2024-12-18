'use client';

import React from 'react';
import AddPurchaseOrder from '@/views/purchase-orders/addOrder/AddPurchaseOrder';
import { addPurchaseOrder } from '@/app/(dashboard)/purchase-orders/actions';

const AddPurchaseOrderIndex = ({ vendors, products, taxRates, banks, signatures, purchaseOrderNumber }) => {
  const handleSave = async (orderData, signatureURL) => {
    const response = await addPurchaseOrder(orderData, signatureURL);
    return response;
  };

  return (
    <AddPurchaseOrder
      onSave={handleSave}
      vendors={vendors}
      products={products}
      taxRates={taxRates}
      banks={banks}
      signatures={signatures}
      purchaseOrderNumber={purchaseOrderNumber}
    />
  );
};

export default AddPurchaseOrderIndex;