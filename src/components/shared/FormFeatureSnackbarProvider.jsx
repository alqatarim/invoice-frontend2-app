'use client';

import React from 'react';
import { IconButton } from '@mui/material';
import { Icon } from '@iconify/react';
import { SnackbarProvider, closeSnackbar } from 'notistack';

/**
 * Shared notistack provider for document forms (invoice, POS, sales return, etc.).
 * Matches invoice add/edit timing, placement, and close action.
 */
const FormFeatureSnackbarProvider = ({ children, maxSnack = 7 }) => {
  const snackbarAction = (snackbarId) => (
    <IconButton onClick={() => closeSnackbar(snackbarId)}>
      <Icon icon="mdi:close" width={25} />
    </IconButton>
  );

  return (
    <SnackbarProvider
      maxSnack={maxSnack}
      autoHideDuration={5000}
      preventDuplicate
      action={snackbarAction}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      {children}
    </SnackbarProvider>
  );
};

export default FormFeatureSnackbarProvider;
