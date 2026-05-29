import React from 'react';
import Purchase from '@/views/purchases/purchase';
import { useEditPurchaseHandlers } from '@/views/purchases/handler';
import { getEditPurchaseColumns } from './EditPurchaseColumns';

const EditPurchase = ({ vendorsData, productData, taxRates, initialBanks, employees, onSave, enqueueSnackbar, closeSnackbar, purchaseData }) => {
  const handlers = useEditPurchaseHandlers({
    purchaseData,
    productData,
    initialBanks,
    employees,
    onSave,
    enqueueSnackbar,
    closeSnackbar,
    addBank: null,
  });

  return (
    <Purchase
      mode="edit"
      title="Edit Purchase"
      documentNumber={purchaseData?.purchaseId}
      recordId={purchaseData?._id}
      vendorsData={vendorsData}
      taxRates={taxRates}
      handlers={handlers}
      columnsFactory={getEditPurchaseColumns}
    />
  );
};

export default EditPurchase;
