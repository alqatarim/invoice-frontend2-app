'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppSnackbar from '@/components/shared/AppSnackbar';
import AddVendorDialog from './AddVendor';
import { addVendor } from '@/app/(dashboard)/vendors/actions';

const AddVendorPage = ({ initialErrorMessage = '' }) => {
  const router = useRouter();
  const [snackbar, setSnackbar] = useState({
    open: Boolean(initialErrorMessage),
    message: initialErrorMessage || '',
    severity: initialErrorMessage ? 'error' : 'success',
  });

  const handleClose = useCallback(() => {
    router.push('/vendors/vendor-list');
  }, [router]);

  const handleSave = useCallback(async (data) => {
    try {
      const response = await addVendor(data);

      if (!response.success) {
        const message = response.error?.message || response.message || 'Failed to add vendor';
        setSnackbar({ open: true, message, severity: 'error' });
        return { success: false, message };
      }

      setSnackbar({ open: true, message: 'Vendor added successfully!', severity: 'success' });
      handleClose();
      return response;
    } catch (error) {
      const message = error.message || 'Failed to add vendor';
      setSnackbar({ open: true, message, severity: 'error' });
      return { success: false, message };
    }
  }, [handleClose]);

  return (
    <>
      <AddVendorDialog
        open
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

export default AddVendorPage;