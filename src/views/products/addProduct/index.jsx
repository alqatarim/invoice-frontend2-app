'use client';

import React, { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import AppSnackbarProvider from '@/components/shared/AppSnackbarProvider';
import AddProduct from './AddProduct';
import useAddProductViewHandler from './handler';
import { addProduct } from '@/app/(dashboard)/products/actions';

const AddProductContent = ({
  initialDropdownData = { units: [], categories: [], taxes: [] },
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
    router.push('/products/product-list');
  }, [router]);

  const handleSave = useCallback(async (data, preparedImage) => {
    const loadingKey = enqueueSnackbar('Submitting product...', {
      variant: 'info',
      persist: true,
      preventDuplicate: true,
    });

    try {
      const response = await addProduct(data, preparedImage);
      closeSnackbar(loadingKey);

      if (!response.success) {
        const message = response.error?.message || response.message || 'Failed to add product';
        onError(message);
        return { success: false, message };
      }
      onSuccess('Product added successfully!');
      handleClose();
      return response;
    } catch (error) {
      const message = error.message || 'Failed to add product';
      closeSnackbar(loadingKey);
      onError(message);
      return { success: false, message };
    }
  }, [closeSnackbar, enqueueSnackbar, handleClose, onError, onSuccess]);

  const controller = useAddProductViewHandler({
    onClose: handleClose,
    onSave: handleSave,
    initialDropdownData,
  });

  return (
    <>
      <AddProduct controller={controller} />
    </>
  );
};

const AddProductPage = props => (
  <AppSnackbarProvider maxSnack={7}>
    <AddProductContent {...props} />
  </AppSnackbarProvider>
);

export default AddProductPage;