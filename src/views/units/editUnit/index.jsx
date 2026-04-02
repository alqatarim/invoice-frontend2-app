'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppSnackbar from '@/components/shared/AppSnackbar';
import EditUnitDialog from './EditUnit';
import { updateUnit } from '@/app/(dashboard)/units/actions';

const EditUnitPage = ({
  id,
  initialUnitData = null,
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

  const handleSave = useCallback(async (unitId, data) => {
    try {
      const response = await updateUnit(unitId, data);

      if (!response.success) {
        const message = response.error?.message || response.message || 'Failed to update unit';
        setSnackbar({ open: true, message, severity: 'error' });
        return { success: false, message };
      }

      setSnackbar({ open: true, message: 'Unit updated successfully!', severity: 'success' });
      handleClose();
      return response;
    } catch (error) {
      const message = error.message || 'Failed to update unit';
      setSnackbar({ open: true, message, severity: 'error' });
      return { success: false, message };
    }
  }, [handleClose]);

  return (
    <>
      <EditUnitDialog
        open
        unitId={id}
        onClose={handleClose}
        onSave={handleSave}
        initialUnitData={initialUnitData}
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

export default EditUnitPage;
