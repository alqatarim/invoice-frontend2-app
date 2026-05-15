'use client';

import React, { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import AppSnackbarProvider from '@/components/shared/AppSnackbarProvider';
import EditVendorDialog from './EditVendor';
import { updateVendor } from '@/app/(dashboard)/vendors/actions';

const EditVendorContent = ({
  id,
  initialVendorData = null,
  initialErrorMessage = '',
}) => {
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

  const handleSave = useCallback(async (vendorId, data) => {
    const loadingKey = enqueueSnackbar('Updating vendor...', {
      variant: 'info',
      persist: true,
      preventDuplicate: true,
    });

    try {
      const response = await updateVendor(vendorId, data);
      closeSnackbar(loadingKey);

      if (!response.success) {
        const message = response.error?.message || response.message || 'Failed to update vendor';
        onError(message);
        return { success: false, message };
      }

      onSuccess('Vendor updated successfully!');
      return response;
    } catch (error) {
      const message = error.message || 'Failed to update vendor';
      closeSnackbar(loadingKey);
      onError(message);
      return { success: false, message };
    }
  }, [closeSnackbar, enqueueSnackbar, onError, onSuccess]);

  return (
    <EditVendorDialog
      open
      vendorId={id}
      onClose={handleClose}
      onSave={handleSave}
      onError={onError}
      initialVendorData={initialVendorData}
    />
  );
};

const EditVendorPage = props => (
  <AppSnackbarProvider maxSnack={7}>
    <EditVendorContent {...props} />
  </AppSnackbarProvider>
);

export default EditVendorPage;
