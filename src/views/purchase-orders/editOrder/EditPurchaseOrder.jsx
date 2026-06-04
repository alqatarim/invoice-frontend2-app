import React from 'react';
import PurchaseOrder from '@/views/purchase-orders/purchaseOrder';
import { useEditPurchaseOrderHandlers } from '@/views/purchase-orders/handler';
import { getPurchaseOrderFormColumns } from '@/views/purchase-orders/purchaseOrderFormColumns';

const EditPurchaseOrder = ({ vendorsData, productData, taxRates, initialBanks, employees, onSave, enqueueSnackbar, closeSnackbar, purchaseOrderData }) => {
  const handlers = useEditPurchaseOrderHandlers({
    purchaseOrderData,
    productData,
    employees,
    initialBanks,
    onSave,
    enqueueSnackbar,
    closeSnackbar,
    addBank: null,
  });

  return (
    <PurchaseOrder
      mode="edit"
      title="Edit Purchase Order"
      documentNumber={purchaseOrderData?.purchaseOrderId}
      recordId={purchaseOrderData?._id}
      vendorsData={vendorsData}
      taxRates={taxRates}
      handlers={handlers}
      columnsFactory={getPurchaseOrderFormColumns}
    />
  );
};

export default EditPurchaseOrder;
