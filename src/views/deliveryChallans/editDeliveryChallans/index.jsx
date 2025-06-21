'use client';

import React from 'react';
import { SnackbarProvider, closeSnackbar, useSnackbar } from 'notistack';
import EditDeliveryChallan from './EditDeliveryChallan';
import { updateDeliveryChallan } from '@/app/(dashboard)/deliveryChallans/actions';
import { IconButton } from '@mui/material';
import { Icon } from '@iconify/react';

const EditDeliveryChallanContent = ({ 
  id,
  deliveryChallanData, 
  customersData, 
  productData, 
  taxRates, 
  initialBanks, 
  signatures,
  addBank
}) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleUpdate = async (formData, signatureURL) => {
    try {
      const loadingKey = enqueueSnackbar('Updating delivery challan...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      });

      const response = await updateDeliveryChallan(id, formData, signatureURL);
      closeSnackbar(loadingKey);

      if (!response.success) {
        const errorMessage = response.error?.message || response.message || 'Failed to update delivery challan';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        });
        return { success: false, message: errorMessage };
      }

      enqueueSnackbar('Delivery challan updated successfully!', {
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
    <EditDeliveryChallan
      id={id}
      deliveryChallanData={deliveryChallanData}
      customersData={customersData}
      productData={productData}
      taxRates={taxRates}
      initialBanks={initialBanks}
      signatures={signatures}
      onSave={handleUpdate}
      enqueueSnackbar={enqueueSnackbar}
      closeSnackbar={closeSnackbar}
      addBank={addBank}
    />
  );
};

const EditDeliveryChallanIndex = (props) => {
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
      <EditDeliveryChallanContent {...props} />
    </SnackbarProvider>
  );
};

export default EditDeliveryChallanIndex;