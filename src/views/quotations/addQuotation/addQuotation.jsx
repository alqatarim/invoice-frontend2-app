import React from 'react';
import Quotation from '@/views/quotations/quotation';

const AddQuotation = ({ customersData, productData, taxRates, initialBanks, employees, onSave, enqueueSnackbar, closeSnackbar, quotationNumber }) => (
  <Quotation
    mode="add"
    quotationNumber={quotationNumber}
    customers={customersData}
    productData={productData}
    taxRates={taxRates}
    initialBanks={initialBanks}
    employees={employees}
    onSubmit={onSave}
    enqueueSnackbar={enqueueSnackbar}
    closeSnackbar={closeSnackbar}
  />
);

export default AddQuotation;
