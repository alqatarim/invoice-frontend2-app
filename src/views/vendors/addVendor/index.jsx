'use client';

import React from 'react';
import { SnackbarProvider, closeSnackbar, useSnackbar } from 'notistack';
import AddVendor from './AddVendor';
import { addVendor } from '@/app/(dashboard)/vendors/actions';
import { IconButton } from '@mui/material';
import { Icon } from '@iconify/react';

const AddVendorContent = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleAdd = async (formData) => {
    try {
      const loadingKey = enqueueSnackbar('Adding vendor...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      });

      const response = await addVendor(formData);
      closeSnackbar(loadingKey);

      if (!response.success) {
        const errorMessage = response.error?.message || response.message || 'Failed to add vendor';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        });
        return { success: false, message: errorMessage };
      }

      enqueueSnackbar('Vendor added successfully!', {
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
    <AddVendor
      onSave={handleAdd}
      enqueueSnackbar={enqueueSnackbar}
      closeSnackbar={closeSnackbar}
    />
  );
};

const AddVendorIndex = (props) => {
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
      <AddVendorContent {...props} />
    </SnackbarProvider>
  );
};

export default AddVendorIndex;