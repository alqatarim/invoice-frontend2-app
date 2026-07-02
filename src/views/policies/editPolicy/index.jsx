'use client';

import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import FormFeatureSnackbarProvider from '@/components/shared/FormFeatureSnackbarProvider';
import { updateWarrantyPolicy } from '@/app/(dashboard)/policies/actions';
import EditPolicy from './EditPolicy';

const EditPolicyContent = ({ policy, initialErrorMessage = '' }) => {
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
    const loadingKey = enqueueSnackbar('Updating warranty policy...', {
      variant: 'info',
      persist: true,
      preventDuplicate: true,
    });

    try {
      const response = await updateWarrantyPolicy(policy?._id, payload);
      closeSnackbar(loadingKey);

      if (!response.success) {
        const message = response.message || 'Failed to update warranty policy';
        onError(message);
        return { success: false, message };
      }

      onSuccess(response.message || 'Warranty policy updated successfully');
      return response;
    } catch (error) {
      const message = error.message || 'Failed to update warranty policy';
      closeSnackbar(loadingKey);
      onError(message);
      return { success: false, message };
    }
  }, [closeSnackbar, enqueueSnackbar, onError, onSuccess, policy?._id]);

  if (!policy) {
    return (
      <div className="rounded border border-errorLight bg-errorLightest p-4 text-error">
        {initialErrorMessage || 'Warranty policy not found.'}
      </div>
    );
  }

  return (
    <EditPolicy
      policy={policy}
      initialErrorMessage={initialErrorMessage}
      onSave={handleSave}
      onError={onError}
    />
  );
};

const EditPolicyIndex = props => (
  <FormFeatureSnackbarProvider>
    <EditPolicyContent {...props} />
  </FormFeatureSnackbarProvider>
);

export default EditPolicyIndex;
