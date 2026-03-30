'use client';

import React, { useCallback } from 'react';
import { IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { SnackbarProvider, closeSnackbar, useSnackbar } from 'notistack';
import BankDetailsDialog from '@/components/custom-components/BankDetailsDialog';
import AppSnackbar from '@/components/shared/AppSnackbar';
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
  initialSignatures = [],
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
    signatures: initialSignatures,
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

      <AppSnackbar
        open={controller.snackbar.open}
        message={controller.snackbar.message}
        severity={controller.snackbar.severity}
        onClose={() => controller.setSnackbar((current) => ({ ...current, open: false }))}
        autoHideDuration={3000}
      />

      <InvoiceTermsDialog controller={controller} theme={theme} />
    </>
  );
};

const EditInvoiceIndex = (props) => {
  const snackbarAction = (snackbarId) => (
    <IconButton onClick={() => closeSnackbar(snackbarId)}>
      <Icon icon='mdi:close' width={25} />
    </IconButton>
  );

  return (
    <SnackbarProvider
      maxSnack={7}
      autoHideDuration={5000}
      preventDuplicate
      action={snackbarAction}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <EditInvoiceContent {...props} />
    </SnackbarProvider>
  );
};

export default EditInvoiceIndex;
