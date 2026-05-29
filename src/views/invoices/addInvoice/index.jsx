'use client';

import React, { useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import FormFeatureSnackbarProvider from '@/components/shared/FormFeatureSnackbarProvider';
import AddInvoice from './AddInvoice';
import useAddInvoiceFeatureHandler from './handler';
import { addInvoice, addBank } from '@/app/(dashboard)/invoices/add/actions';

const AddInvoiceContent = ({
  initialCustomersData = [],
  initialProductData = [],
  initialTaxRates = [],
  initialBanks = [],
  initialCashiers = [],
  initialCurrentUserId = '',
  initialInvoiceNumber = '',
  initialBranchesData = [],
}) => {
  const theme = useTheme();
  const { enqueueSnackbar, closeSnackbar: dismissSnackbar } = useSnackbar();

  const handleAddInvoice = useCallback(async (formData) => {
    try {
      const loadingKey = enqueueSnackbar('Adding invoice...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      });

      const response = await addInvoice(formData);
      dismissSnackbar(loadingKey);

      if (!response.success) {
        const errorMessage = response.error?.message || response.message || 'Failed to add invoice';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        });

        return { success: false, message: errorMessage };
      }

      enqueueSnackbar('Invoice added successfully!', {
        variant: 'success',
        autoHideDuration: 3000,
      });

      return response;
    } catch (error) {
      dismissSnackbar();
      const errorMessage = error.message || 'An unexpected error occurred';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      return { success: false, message: errorMessage };
    }
  }, [dismissSnackbar, enqueueSnackbar]);

  const controller = useAddInvoiceFeatureHandler({
    initialInvoiceNumber,
    customersData: initialCustomersData,
    productData: initialProductData,
    taxRates: initialTaxRates,
    initialBanks,
    cashiersData: initialCashiers,
    currentUserId: initialCurrentUserId,
    branchesData: initialBranchesData,
    onSave: handleAddInvoice,
    addBank,
    enqueueSnackbar,
    closeSnackbar: dismissSnackbar,
  });

  return (
    <>
      <AddInvoice
        controller={controller}
        customersData={initialCustomersData}
        productData={initialProductData}
      />

      <BankDetailsDialog
        open={controller.openBankModal}
        onClose={() => controller.setOpenBankModal(false)}
        newBank={controller.newBank}
        setNewBank={controller.setNewBank}
        handleAddBank={controller.handleAddBank}
      />

      <InvoiceTermsDialog controller={controller} theme={theme} />
    </>
  );
};

const AddInvoiceIndex = (props) => (
  <FormFeatureSnackbarProvider>
    <AddInvoiceContent {...props} />
  </FormFeatureSnackbarProvider>
);

export default AddInvoiceIndex;
