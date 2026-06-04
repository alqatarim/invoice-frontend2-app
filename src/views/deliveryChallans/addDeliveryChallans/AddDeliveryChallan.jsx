import React from 'react';
import DeliveryChallan from '@/views/deliveryChallans/deliveryChallan';
import useDeliveryChallanHandlers from '../handler';
import { getDeliveryChallanFormColumns } from '../deliveryChallanFormColumns';
import { formatDateForInput } from '@/utils/dateUtils';

const AddDeliveryChallan = ({
  customersData,
  productData,
  taxRates,
  initialBanks,
  initialSignatures,
  onSave,
  enqueueSnackbar,
  closeSnackbar,
  addBank,
  deliveryChallanNumber,
}) => {
  const deliveryChallanData = {
    deliveryChallanNumber: deliveryChallanNumber?.data || deliveryChallanNumber || '',
    customerId: '',
    deliveryChallanDate: formatDateForInput(new Date()),
    dueDate: '',
    bank: '',
    referenceNo: '',
    notes: '',
    termsAndCondition: '',
    address: '',
    items: [],
  };

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
  });

  return (
    <DeliveryChallan
      mode="add"
      deliveryChallanData={deliveryChallanData}
      customersData={customersData}
      taxRates={taxRates}
      handlers={handlers}
      columnsFactory={getDeliveryChallanFormColumns}
    />
  );
};

export default AddDeliveryChallan;
