import React from 'react';
import SalesReturn from '@/views/salesReturn/salesReturn';
import useSalesReturnHandler from '../handler';
import { getSalesReturnColumns } from '../salesReturnColumns';

const AddSalesReturn = ({ customersData, productData, taxRates, initialBanks, employees, onSave, enqueueSnackbar, closeSnackbar, salesReturnNumber }) => {
  const handlers = useSalesReturnHandler({
    mode: 'add',
    salesReturnNumber,
    productData,
    initialBanks,
    employees,
    onSave,
    enqueueSnackbar,
    closeSnackbar,
    addBank: null,
  });

  return (
    <SalesReturn
      mode="add"
      title="Add Sales Return"
      documentNumber={salesReturnNumber}
      customersData={customersData}
      taxRates={taxRates}
      handlers={handlers}
      columnsFactory={getSalesReturnColumns}
    />
  );
};

export default AddSalesReturn;
