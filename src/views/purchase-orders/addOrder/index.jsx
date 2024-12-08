'use client';

import React from 'react';
import AddPurchaseOrder from './AddPurchaseOrder';
import { addPurchaseOrder } from '@/app/(dashboard)/purchase-orders/actions';

const AddPurchaseOrderIndex = ({ initialData }) => {
  const handleSave = async (orderData) => {
    const response = await addPurchaseOrder(orderData);
    return response;
  };

  return (
    <AddPurchaseOrder
      onSave={handleSave}
      dropdownData={initialData}
    />
  );
};

export default AddPurchaseOrderIndex;