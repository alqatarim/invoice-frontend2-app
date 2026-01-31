'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Snackbar, Alert } from '@mui/material';
import AddProductDialog from './AddProductDialog';
import { addProduct } from '@/app/(dashboard)/products/actions';

const AddProductPage = () => {
  const router = useRouter();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleClose = useCallback(() => {
    router.push('/products/product-list');
  }, [router]);

  const handleSave = useCallback(async (data, preparedImage) => {
    try {
      const response = await addProduct(data, preparedImage);
      if (!response.success) {
        const message = response.error?.message || response.message || 'Failed to add product';
        setSnackbar({ open: true, message, severity: 'error' });
        return { success: false, message };
      }
      setSnackbar({ open: true, message: 'Product added successfully!', severity: 'success' });
      handleClose();
      return response;
    } catch (error) {
      const message = error.message || 'Failed to add product';
      setSnackbar({ open: true, message, severity: 'error' });
      return { success: false, message };
    }
  }, [handleClose]);

  return (
    <>
      <AddProductDialog
        open
        variant="page"
        onClose={handleClose}
        onSave={handleSave}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={(_, reason) => reason !== 'clickaway' && setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddProductPage;