'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppSnackbar from '@/components/shared/AppSnackbar';
import AddUnitDialog from './AddUnit';
import { addUnit } from '@/app/(dashboard)/units/actions';

const AddUnitPage = ({
  initialDropdownOptions = { units: [] },
  initialErrorMessage = '',
}) => {
  const router = useRouter();
  const [snackbar, setSnackbar] = useState({
    open: Boolean(initialErrorMessage),
    message: initialErrorMessage || '',
    severity: initialErrorMessage ? 'error' : 'success',
  });

  const handleClose = useCallback(() => {
    router.push('/units/unit-list');
  }, [router]);

  const handleSave = useCallback(async (data) => {
    try {
      const response = await addUnit(data);

      if (!response.success) {
        const message = response.error?.message || response.message || 'Failed to add unit';
        setSnackbar({ open: true, message, severity: 'error' });
        return { success: false, message };
      }

      setSnackbar({ open: true, message: 'Unit added successfully!', severity: 'success' });
      handleClose();
      return response;
    } catch (error) {
      const message = error.message || 'Failed to add unit';
      setSnackbar({ open: true, message, severity: 'error' });
      return { success: false, message };
    }
  }, [handleClose]);

  return (
    <>
      <AddUnitDialog
        open
        onClose={handleClose}
        onSave={handleSave}
        initialDropdownOptions={initialDropdownOptions}
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

export default AddUnitPage;
