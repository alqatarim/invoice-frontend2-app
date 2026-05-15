'use client';

import React, { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import AppSnackbarProvider from '@/components/shared/AppSnackbarProvider';
import EditProduct from './EditProduct';
import useEditProductViewHandler from './handler';
import { updateProduct } from '@/app/(dashboard)/products/actions';

const EditProductContent = ({
  id,
  initialProductData = null,
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

  const handleSave = useCallback(async (productId, data, preparedImage) => {
    const loadingKey = enqueueSnackbar('Updating product...', {
      variant: 'info',
      persist: true,
      preventDuplicate: true,
    });

    try {
      const response = await updateProduct(productId, data, preparedImage);
      closeSnackbar(loadingKey);

      if (!response.success) {
        const message = response.error?.message || response.message || 'Failed to update product';
        onError(message);
        return { success: false, message };
      }
      onSuccess('Product updated successfully!');
      handleClose();
      return response;
    } catch (error) {
      const message = error.message || 'Failed to update product';
      closeSnackbar(loadingKey);
      onError(message);
      return { success: false, message };
    }
  }, [closeSnackbar, enqueueSnackbar, handleClose, onError, onSuccess]);

  const controller = useEditProductViewHandler({
    productId: id,
    initialProductData,
    initialDropdownData,
    onClose: handleClose,
    onSave: handleSave,
  });

  return (
    <>
      <EditProduct controller={controller} />
    </>
  );
};

const EditProductPage = props => (
  <AppSnackbarProvider maxSnack={7}>
    <EditProductContent {...props} />
  </AppSnackbarProvider>
);

export default EditProductPage;