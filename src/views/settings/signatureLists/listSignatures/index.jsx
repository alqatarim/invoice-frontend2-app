'use client'

import React, { useState } from 'react'
import { actionsHandler, dataHandler } from '../handler'
import SignatureListView from './SignatureListView'
import SettingsLayout from '../../shared/SettingsLayout'
import AppSnackbar from '@/components/shared/AppSnackbar'

const SignatureListIndex = ({ initialData = [] }) => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Initialize data handler for fetching fresh data
  const dataHandlers = dataHandler({
    initialSignatures: initialData.signatures || [],
    onError: (message) => setSnackbar({ open: true, message, severity: 'error' }),
    onSuccess: () => {}, // Don't show "Data refreshed successfully" message
  })

  // Initialize action handlers with refetch callback
  const actionHandlers = actionsHandler({
    onError: (message) => setSnackbar({ open: true, message, severity: 'error' }),
    onSuccess: (message) => setSnackbar({ open: true, message, severity: 'success' }),
    refetchData: dataHandlers.fetchData,
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
          initialSignatures={dataHandlers.signatures}
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