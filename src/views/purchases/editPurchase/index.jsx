'use client';

import { Snackbar, Alert } from '@mui/material';
import EditPurchase from '@/views/purchases/editPurchase/EditPurchase';

const EditPurchaseIndex = ({ purchaseData, vendors = [], products = [], taxRates = [], banks = [], signatures = [], units = [] }) => {
  return (
    <EditPurchase
      vendors={vendors}
      products={products}
      taxRates={taxRates}
      banks={banks}
      signatures={signatures}
      units={units}
      purchaseData={purchaseData}
    />
  );
};

export default EditPurchaseIndex;
