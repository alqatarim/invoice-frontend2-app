'use client';

import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import FormFeatureSnackbarProvider from '@/components/shared/FormFeatureSnackbarProvider';
import ViewPolicy from './ViewPolicy';

const ViewPolicyContent = ({ policy, initialErrorMessage = '' }) => {
  const { enqueueSnackbar } = useSnackbar();

  const onError = useCallback(message => {
    enqueueSnackbar(message, {
      variant: 'error',
      autoHideDuration: 5000,
      preventDuplicate: true,
    });
  }, [enqueueSnackbar]);

  if (!policy) {
    return (
      <div className="rounded border border-errorLight bg-errorLightest p-4 text-error">
        {initialErrorMessage || 'Warranty policy not found.'}
      </div>
    );
  }

  return <ViewPolicy policy={policy} initialErrorMessage={initialErrorMessage} onError={onError} />;
};

const ViewPolicyIndex = props => (
  <FormFeatureSnackbarProvider>
    <ViewPolicyContent {...props} />
  </FormFeatureSnackbarProvider>
);

export default ViewPolicyIndex;
