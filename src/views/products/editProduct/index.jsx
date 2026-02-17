'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppSnackbar from '@/components/shared/AppSnackbar';
import EditProductDialog from './EditProductDialog';
import { updateProduct } from '@/app/(dashboard)/products/actions';

const EditProductPage = ({ id, initialProductData = null }) => {
  const router = useRouter();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleClose = useCallback(() => {
    router.push('/products/product-list');
  }, [router]);

  const handleSave = useCallback(async (productId, data, preparedImage) => {
    try {
      const response = await updateProduct(productId, data, preparedImage);
      if (!response.success) {
        const message = response.error?.message || response.message || 'Failed to update product';
        setSnackbar({ open: true, message, severity: 'error' });
        return { success: false, message };
      }
      setSnackbar({ open: true, message: 'Product updated successfully!', severity: 'success' });
      handleClose();
      return response;
    } catch (error) {
      const message = error.message || 'Failed to update product';
      setSnackbar({ open: true, message, severity: 'error' });
      return { success: false, message };
    }
  }, [handleClose]);

  return (
    <>
      <EditProductDialog
        open
        variant="page"
        productId={id}
        initialProductData={initialProductData}
        onClose={handleClose}
        onSave={handleSave}
      />
      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={(_, reason) => reason !== 'clickaway' && setSnackbar(prev => ({ ...prev, open: false }))}
        autoHideDuration={6000}
      />
    </>
  );
};

export default EditProductPage;