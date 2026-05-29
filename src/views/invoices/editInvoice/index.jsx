'use client';

import React, { useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import FormFeatureSnackbarProvider from '@/components/shared/FormFeatureSnackbarProvider';
import BankDetailsDialog from '@/components/custom-components/BankDetailsDialog';
import InvoiceTermsDialog from '@/components/invoices/InvoiceTermsDialog';
import EditInvoice from './EditInvoice';
import useEditInvoiceFeatureHandler from './handler';
import { updateInvoice, addBank } from '@/app/(dashboard)/invoices/edit/[id]/actions';

const EditInvoiceContent = ({
  initialInvoiceData,
  initialCustomersData = [],
  initialProductData = [],
  initialTaxRates = [],
  initialBanks = [],
  initialCashiers = [],
  initialCurrentUserId = '',
  initialBranchesData = [],
}) => {
  const theme = useTheme();
  const { enqueueSnackbar, closeSnackbar: dismissSnackbar } = useSnackbar();

  const handleUpdate = useCallback(
    async (updatedFormData) => {
      try {
        const loadingKey = enqueueSnackbar('Updating invoice...', {
          variant: 'info',
          persist: true,
          preventDuplicate: true,
        });

        const response = await updateInvoice(initialInvoiceData._id, updatedFormData);
        dismissSnackbar(loadingKey);

        if (!response.success) {
          const errorMessage =
            response.error?.message || response.message || 'Failed to update invoice';
          enqueueSnackbar(errorMessage, {
            variant: 'error',
            autoHideDuration: 5000,
            preventDuplicate: true,
          });

          return { success: false, message: errorMessage };
        }

        enqueueSnackbar('Invoice updated successfully!', {
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
    },
    [dismissSnackbar, enqueueSnackbar, initialInvoiceData._id]
  );

  const controller = useEditInvoiceFeatureHandler({
    initialInvoiceData,
    customersData: initialCustomersData,
    productData: initialProductData,
    taxRates: initialTaxRates,
    initialBanks,
    cashiersData: initialCashiers,
    currentUserId: initialCurrentUserId,
    branchesData: initialBranchesData,
    onSave: handleUpdate,
    addBank,
    enqueueSnackbar,
    closeSnackbar: dismissSnackbar,
  });

  return (
    <>
      <EditInvoice
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

const EditInvoiceIndex = (props) => (
  <FormFeatureSnackbarProvider>
    <EditInvoiceContent {...props} />
  </FormFeatureSnackbarProvider>
);

export default EditInvoiceIndex;
