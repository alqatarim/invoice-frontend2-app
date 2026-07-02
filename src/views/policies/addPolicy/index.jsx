'use client';

import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import FormFeatureSnackbarProvider from '@/components/shared/FormFeatureSnackbarProvider';
import { addWarrantyPolicy } from '@/app/(dashboard)/policies/actions';
import AddPolicy from './AddPolicy';

const AddPolicyContent = () => {
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

  const handleSave = useCallback(async payload => {
    const loadingKey = enqueueSnackbar('Creating warranty policy...', {
      variant: 'info',
      persist: true,
      preventDuplicate: true,
    });

    try {
      const response = await addWarrantyPolicy(payload);
      closeSnackbar(loadingKey);

      if (!response.success) {
        const message = response.message || 'Failed to create warranty policy';
        onError(message);
        return { success: false, message };
      }

      onSuccess(response.message || 'Warranty policy created successfully');
      return response;
    } catch (error) {
      const message = error.message || 'Failed to create warranty policy';
      closeSnackbar(loadingKey);
      onError(message);
      return { success: false, message };
    }
  }, [closeSnackbar, enqueueSnackbar, onError, onSuccess]);

  return <AddPolicy onSave={handleSave} onError={onError} />;
};

const AddPolicyIndex = () => (
  <FormFeatureSnackbarProvider>
    <AddPolicyContent />
  </FormFeatureSnackbarProvider>
);

export default AddPolicyIndex;
