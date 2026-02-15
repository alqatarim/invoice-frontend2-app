'use client'

import React, { useState } from 'react'
import { dataHandler } from '@/handlers/settings/signatureLists/dataHandler'
import { actionsHandler } from '@/handlers/settings/signatureLists/actionsHandler'
import SignatureListView from './SignatureListView'
import SettingsLayout from '../../shared/SettingsLayout'
import AppSnackbar from '@/components/shared/AppSnackbar'

const SignatureListIndex = ({ initialData = [] }) => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [signatures, setSignatures] = useState(initialData.signatures || []);

  // Initialize data handler for fetching fresh data
  const dataHandlers = dataHandler({
    initialSignatures: initialData.signatures || [],
    onError: (message) => setSnackbar({ open: true, message, severity: 'error' }),
    onSuccess: () => {}, // Don't show "Data refreshed successfully" message
  })

  // Create a function to refetch data and update local state
  const refetchSignatures = async () => {
    try {
      const freshData = await dataHandlers.fetchData();
      if (freshData?.signatures) {
        setSignatures(freshData.signatures);
      }
    } catch (error) {
      console.error('Error refetching signatures:', error);
    }
  };

  // Initialize action handlers with refetch callback
  const actionHandlers = actionsHandler({
    onError: (message) => setSnackbar({ open: true, message, severity: 'error' }),
    onSuccess: (message) => setSnackbar({ open: true, message, severity: 'success' }),
    refetchData: refetchSignatures, // Pass the refetch function
  })

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <SettingsLayout
        title="Signature Lists"
        breadcrumb={[
          { label: 'Settings', href: '/settings' },
          { label: 'Signature Lists', current: true }
        ]}
      >
        <SignatureListView
          initialSignatures={signatures}
          loading={dataHandlers.loading}
          onAdd={actionHandlers.handleAdd}
          onEdit={actionHandlers.handleUpdate}
          onDelete={actionHandlers.handleDelete}
          onSetDefault={actionHandlers.handleSetDefault}
          onToggleStatus={actionHandlers.handleToggleStatus}
        />
      </SettingsLayout>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleSnackbarClose}
        autoHideDuration={6000}
      />
    </>
  )
}

export default SignatureListIndex