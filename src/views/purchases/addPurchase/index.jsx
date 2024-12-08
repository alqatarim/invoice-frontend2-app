'use client';

import React from 'react';
import AddPurchase from './AddPurchase';
import { addPurchase } from '@/app/(dashboard)/purchases/actions';

const AddPurchaseIndex = ({ initialData }) => {
  const handleSave = async (purchaseData) => {
    const response = await addPurchase(purchaseData);
    return response;
  };

  return (
    <AddPurchase
      onSave={handleSave}
      dropdownData={initialData}
    />
  );
};

export default AddPurchaseIndex;