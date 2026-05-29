import React from 'react';
import DeliveryChallan from '@/views/deliveryChallans/deliveryChallan';
import { formatDateForInput } from '@/utils/dateUtils';

const AddDeliveryChallan = ({ customersData, productData, taxRates, initialBanks, employees, onSave, enqueueSnackbar, closeSnackbar, deliveryChallanNumber }) => (
  <DeliveryChallan
    mode="add"
    deliveryChallanData={{
      deliveryChallanNumber: deliveryChallanNumber?.data || deliveryChallanNumber || '',
      customerId: '',
      deliveryChallanDate: formatDateForInput(new Date()),
      dueDate: '',
      bank: '',
      referenceNo: '',
      employee: '',
      notes: '',
      termsAndCondition: '',
      address: '',
      items: [],
    }}
    customersData={customersData}
    productData={productData}
    taxRates={taxRates}
    initialBanks={initialBanks}
    employees={employees}
    onSave={onSave}
    enqueueSnackbar={enqueueSnackbar}
    closeSnackbar={closeSnackbar}
  />
);

export default AddDeliveryChallan;
