'use client';

import React from 'react';
import { SnackbarProvider, closeSnackbar, useSnackbar } from 'notistack';
import EditVendor from './EditVendor';
import { updateVendor } from '@/app/(dashboard)/vendors/actions';
import { IconButton } from '@mui/material';
import { Icon } from '@iconify/react';

const EditVendorContent = ({ id, vendorData }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleUpdate = async (formData) => {
    try {
      const loadingKey = enqueueSnackbar('Updating vendor...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      });

      const response = await updateVendor(id, formData);
      closeSnackbar(loadingKey);

      if (!response.success) {
        const errorMessage = response.error?.message || response.message || 'Failed to update vendor';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        });
        return { success: false, message: errorMessage };
      }

      enqueueSnackbar('Vendor updated successfully!', {
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
    <EditVendor
      id={id}
      vendorData={vendorData}
      onSave={handleUpdate}
      enqueueSnackbar={enqueueSnackbar}
      closeSnackbar={closeSnackbar}
    />
  );
};

const EditVendorIndex = (props) => {
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
      <EditVendorContent {...props} />
    </SnackbarProvider>
  );
};

export default EditVendorIndex;