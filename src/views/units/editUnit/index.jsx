'use client';

import React, { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import AppSnackbarProvider from '@/components/shared/AppSnackbarProvider';
import EditUnitDialog from './EditUnit';
import { updateUnit } from '@/app/(dashboard)/units/actions';

const EditUnitContent = ({
  id,
  initialUnitData = null,
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

  const handleSave = useCallback(async (unitId, data) => {
    const loadingKey = enqueueSnackbar('Updating unit...', {
      variant: 'info',
      persist: true,
      preventDuplicate: true,
    });

    try {
      const response = await updateUnit(unitId, data);
      closeSnackbar(loadingKey);

      if (!response.success) {
        const message = response.error?.message || response.message || 'Failed to update unit';
        onError(message);
        return { success: false, message };
      }

      onSuccess('Unit updated successfully!');
      handleClose();
      return response;
    } catch (error) {
      const message = error.message || 'Failed to update unit';
      closeSnackbar(loadingKey);
      onError(message);
      return { success: false, message };
    }
  }, [closeSnackbar, enqueueSnackbar, handleClose, onError, onSuccess]);

  return (
    <>
      <EditUnitDialog
        open
        unitId={id}
        onClose={handleClose}
        onSave={handleSave}
        initialUnitData={initialUnitData}
        initialDropdownOptions={initialDropdownOptions}
      />
    </>
  );
};

const EditUnitPage = props => (
  <AppSnackbarProvider maxSnack={7}>
    <EditUnitContent {...props} />
  </AppSnackbarProvider>
);

export default EditUnitPage;
