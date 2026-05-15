'use client';

import React, { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import AppSnackbarProvider from '@/components/shared/AppSnackbarProvider';
import AddVendorDialog from './AddVendor';
import { addVendor } from '@/app/(dashboard)/vendors/actions';

const AddVendorContent = ({ initialErrorMessage = '' }) => {
  const router = useRouter();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const onError = useCallback(message => {
    enqueueSnackbar(message, {
      variant: 'error',
      autoHideDuration: 5000,
      preventDuplicate: true,
    });
  }, [enqueueSnackbar]);

  const onSuccess = useCallback(message => {
    enqueueSnackbar(message, {
      variant: 'success',
      autoHideDuration: 3000,
    });
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (initialErrorMessage) {
      onError(initialErrorMessage);
    }
  }, [initialErrorMessage, onError]);

  const handleClose = useCallback(() => {
    router.push('/vendors/vendor-list');
  }, [router]);

  const handleSave = useCallback(async data => {
    const loadingKey = enqueueSnackbar('Submitting vendor...', {
      variant: 'info',
      persist: true,
      preventDuplicate: true,
    });

    try {
      const response = await addVendor(data);
      closeSnackbar(loadingKey);

      if (!response.success) {
        const message = response.error?.message || response.message || 'Failed to add vendor';
        onError(message);
        return { success: false, message };
      }

      onSuccess('Vendor added successfully!');
      return response;
    } catch (error) {
      const message = error.message || 'Failed to add vendor';
      closeSnackbar(loadingKey);
      onError(message);
      return { success: false, message };
    }
  }, [closeSnackbar, enqueueSnackbar, onError, onSuccess]);

  return (
    <AddVendorDialog
      open
      onClose={handleClose}
      onSave={handleSave}
      onError={onError}
    />
  );
};

const AddVendorPage = props => (
  <AppSnackbarProvider maxSnack={7}>
    <AddVendorContent {...props} />
  </AppSnackbarProvider>
);

export default AddVendorPage;
