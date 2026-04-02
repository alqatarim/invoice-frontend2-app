'use client';

import React from 'react';
import { IconButton } from '@mui/material';
import { Icon } from '@iconify/react';
import { SnackbarProvider, closeSnackbar, useSnackbar } from 'notistack';
import PosPage from './PosPage';
import { checkoutPosSale } from '@/app/(dashboard)/pos/actions';
import { usePosViewHandler } from './handler';

const PosContent = ({
  initialCustomersData = [],
  initialProductData = [],
  initialTaxRates = [],
  initialBanks = [],
  initialSignatures = [],
  initialBranchesData = [],
  initialPosSettings = {},
  initialInvoiceNumber = '',
  initialPaymentMethods = [],
  initialErrorMessage = '',
}) => {
  const { enqueueSnackbar, closeSnackbar: dismissSnackbar } = useSnackbar();

  const handleCheckout = async (payload) => {
    try {
      const loadingKey = enqueueSnackbar('Completing sale...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      });

      const response = await checkoutPosSale(payload);
      dismissSnackbar(loadingKey);

      if (!response.success) {
        enqueueSnackbar(response.message || 'Failed to complete POS checkout', {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        });
      }

      return response;
    } catch (error) {
      dismissSnackbar();
      const errorMessage = error.message || 'Failed to complete POS checkout';
      enqueueSnackbar(errorMessage, {
        variant: 'error',
        autoHideDuration: 5000,
      });

      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const handler = usePosViewHandler({
    initialCustomersData,
    initialProductData,
    initialTaxRates,
    initialBanks,
    initialSignatures,
    initialBranchesData,
    initialPosSettings,
    initialInvoiceNumber,
    initialPaymentMethods,
    initialErrorMessage,
    onSave: handleCheckout,
    enqueueSnackbar,
    closeSnackbar: dismissSnackbar,
  });

  return (
    <PosPage
      initialTaxRates={initialTaxRates}
      initialInvoiceNumber={initialInvoiceNumber}
      controller={handler.controller}
      canAccessPos={handler.canAccessPos}
      canCreateInvoice={handler.canCreateInvoice}
      primaryStore={handler.primaryStore}
    />
  );
};

const PosIndex = (props) => {
  const snackbarAction = (snackbarId) => (
    <IconButton onClick={() => closeSnackbar(snackbarId)}>
      <Icon icon="mdi:close" width={25} />
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
      <PosContent {...props} />
    </SnackbarProvider>
  );
};

export default PosIndex;
