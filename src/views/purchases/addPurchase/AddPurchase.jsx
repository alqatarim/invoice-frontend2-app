import React from 'react';
import Purchase from '@/views/purchases/purchase';
import { useAddPurchaseHandlers } from '@/views/purchases/handler';
import { getAddPurchaseColumns } from './AddPurchaseColumns';

const AddPurchase = ({ vendorsData, productData, taxRates, initialBanks, employees, onSave, enqueueSnackbar, closeSnackbar, purchaseNumber }) => {
  const handlers = useAddPurchaseHandlers({
    purchaseId: purchaseNumber,
    productData,
    employees,
    initialBanks,
    onSave,
    enqueueSnackbar,
    closeSnackbar,
    addBank: null,
  });

  return (
    <Purchase
      mode="add"
      title="Add Purchase"
      documentNumber={purchaseNumber}
      vendorsData={vendorsData}
      taxRates={taxRates}
      handlers={handlers}
      columnsFactory={getAddPurchaseColumns}
    />
  );
};

export default AddPurchase;
