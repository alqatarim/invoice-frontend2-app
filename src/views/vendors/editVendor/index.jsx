'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppSnackbar from '@/components/shared/AppSnackbar';
import EditVendorDialog from './EditVendor';
import { updateVendor } from '@/app/(dashboard)/vendors/actions';

const EditVendorPage = ({
  id,
  initialVendorData = null,
  initialErrorMessage = '',
}) => {
  const router = useRouter();
  const [snackbar, setSnackbar] = useState({
    open: Boolean(initialErrorMessage),
    message: initialErrorMessage || '',
    severity: initialErrorMessage ? 'error' : 'success',
  });

  const handleClose = useCallback(() => {
    router.push('/vendors/vendor-list');
  }, [router]);

  const handleSave = useCallback(async (vendorId, data) => {
    try {
      const response = await updateVendor(vendorId, data);

      if (!response.success) {
        const message = response.error?.message || response.message || 'Failed to update vendor';
        setSnackbar({ open: true, message, severity: 'error' });
        return { success: false, message };
      }

      setSnackbar({ open: true, message: 'Vendor updated successfully!', severity: 'success' });
      handleClose();
      return response;
    } catch (error) {
      const message = error.message || 'Failed to update vendor';
      setSnackbar({ open: true, message, severity: 'error' });
      return { success: false, message };
    }
  }, [handleClose]);

  return (
    <>
      <EditVendorDialog
        open
        vendorId={id}
        onClose={handleClose}
        onSave={handleSave}
        initialVendorData={initialVendorData}
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

export default EditVendorPage;