import React from 'react';
import DeliveryChallan from '@/views/deliveryChallans/deliveryChallan';
import useDeliveryChallanHandlers from '../handler';
import { getDeliveryChallanFormColumns } from '../deliveryChallanFormColumns';

const EditDeliveryChallan = ({
  id,
  deliveryChallanData,
  customersData,
  productData,
  taxRates,
  initialBanks,
  initialSignatures,
  onSave,
  enqueueSnackbar,
  closeSnackbar,
  addBank,
  disabled = false,
}) => {
  const handlers = useDeliveryChallanHandlers({
    deliveryChallanData,
    customersData,
    productData,
    initialBanks,
    employees: initialSignatures,
    onSave,
    enqueueSnackbar,
    closeSnackbar,
    addBank,
    saveMode: 'edit',
  });

  return (
    <DeliveryChallan
      mode="edit"
      id={id}
      deliveryChallanData={deliveryChallanData}
      customersData={customersData}
      taxRates={taxRates}
      handlers={handlers}
      columnsFactory={getDeliveryChallanFormColumns}
      disabled={disabled}
    />
  );
};

export default EditDeliveryChallan;
