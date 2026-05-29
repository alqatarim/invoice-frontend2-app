import React from 'react';
import PurchaseOrder from '@/views/purchase-orders/purchaseOrder';
import { useAddPurchaseOrderHandlers } from '@/views/purchase-orders/handler';
import { getAddPurchaseOrderColumns } from './AddPurchaseOrderColumns';

const AddPurchaseOrder = ({ vendorsData, productData, taxRates, initialBanks, employees, onSave, enqueueSnackbar, closeSnackbar, purchaseOrderNumber }) => {
  const handlers = useAddPurchaseOrderHandlers({
    purchaseOrderId: purchaseOrderNumber,
    productData,
    initialBanks,
    employees,
    onSave,
    enqueueSnackbar,
    closeSnackbar,
    addBank: null,
  });

  return (
    <PurchaseOrder
      mode="add"
      title="Add Purchase Order"
      documentNumber={purchaseOrderNumber}
      vendorsData={vendorsData}
      taxRates={taxRates}
      handlers={handlers}
      columnsFactory={getAddPurchaseOrderColumns}
    />
  );
};

export default AddPurchaseOrder;
