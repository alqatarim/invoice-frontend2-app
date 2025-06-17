'use client';

import React from 'react';
import { SnackbarProvider, closeSnackbar, useSnackbar } from 'notistack';
import AddDeliveryChallan from './AddDeliveryChallan';
import { addDeliveryChallan } from '@/app/(dashboard)/deliveryChallans/actions';
import { IconButton } from '@mui/material';
import { Icon } from '@iconify/react';

const AddDeliveryChallanContent = ({ customersData, productData, taxRates, initialBanks, signatures, deliveryChallanNumber }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleAdd = async (formData, signatureURL) => {
    try {
      const loadingKey = enqueueSnackbar('Adding delivery challan...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      });

      const response = await addDeliveryChallan(formData, signatureURL);
      closeSnackbar(loadingKey);

      if (!response.success) {
        const errorMessage = response.error?.message || response.message || 'Failed to add delivery challan';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        });
        return { success: false, message: errorMessage };
      }

      enqueueSnackbar('Delivery challan added successfully!', {
        variant: 'success',
        autoHideDuration: 3000,
      });
      return response;
    } catch (error) {
      closeSnackbar();
      const errorMessage = error.message || 'An unexpected error occurred';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      return { success: false, message: errorMessage };
    }
  };

  return (
    <AddDeliveryChallan
      customersData={customersData}
      productData={productData}
      taxRates={taxRates}
      initialBanks={initialBanks}
      signatures={signatures}
      onSave={handleAdd}
      enqueueSnackbar={enqueueSnackbar}
      closeSnackbar={closeSnackbar}
      deliveryChallanNumber={deliveryChallanNumber}
    />
  );
};

const AddDeliveryChallanIndex = (props) => {
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
      <AddDeliveryChallanContent {...props} />
    </SnackbarProvider>
  );
};

export default AddDeliveryChallanIndex;