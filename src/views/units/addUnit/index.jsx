'use client';

import React, { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import AppSnackbarProvider from '@/components/shared/AppSnackbarProvider';
import AddUnitDialog from './AddUnit';
import { addUnit } from '@/app/(dashboard)/units/actions';

const AddUnitContent = ({
  initialDropdownOptions = { units: [] },
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
    router.push('/units/unit-list');
  }, [router]);

  const handleSave = useCallback(async (data) => {
    const loadingKey = enqueueSnackbar('Submitting unit...', {
      variant: 'info',
      persist: true,
      preventDuplicate: true,
    });

    try {
      const response = await addUnit(data);
      closeSnackbar(loadingKey);

      if (!response.success) {
        const message = response.error?.message || response.message || 'Failed to add unit';
        onError(message);
        return { success: false, message };
      }

      onSuccess('Unit added successfully!');
      handleClose();
      return response;
    } catch (error) {
      const message = error.message || 'Failed to add unit';
      closeSnackbar(loadingKey);
      onError(message);
      return { success: false, message };
    }
  }, [closeSnackbar, enqueueSnackbar, handleClose, onError, onSuccess]);

  return (
    <>
      <AddUnitDialog
        open
        onClose={handleClose}
        onSave={handleSave}
        initialDropdownOptions={initialDropdownOptions}
      />
    </>
  );
};

const AddUnitPage = props => (
  <AppSnackbarProvider maxSnack={7}>
    <AddUnitContent {...props} />
  </AppSnackbarProvider>
);

export default AddUnitPage;
