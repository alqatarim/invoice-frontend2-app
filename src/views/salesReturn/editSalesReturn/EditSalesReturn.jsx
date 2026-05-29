import React from 'react';
import SalesReturn from '@/views/salesReturn/salesReturn';
import useSalesReturnHandler from '../handler';
import { getSalesReturnColumns } from '../salesReturnColumns';

const EditSalesReturn = ({ customersData, productData, taxRates, initialBanks, employees, onSave, enqueueSnackbar, closeSnackbar, salesReturnData }) => {
  const handlers = useSalesReturnHandler({
    mode: 'edit',
    salesReturnData,
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
      mode="edit"
      title="Edit Sales Return"
      documentNumber={salesReturnData?.salesReturnNumber}
      recordId={salesReturnData?._id}
      customersData={customersData}
      taxRates={taxRates}
      handlers={handlers}
      columnsFactory={getSalesReturnColumns}
    />
  );
};

export default EditSalesReturn;
