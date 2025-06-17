'use client';

import React from 'react';
import { SnackbarProvider, closeSnackbar, useSnackbar } from 'notistack';
import ViewVendor from './ViewVendor';
import { IconButton } from '@mui/material';
import { Icon } from '@iconify/react';

const ViewVendorContent = ({ id }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const onError = (message) => {
    enqueueSnackbar(message, {
      variant: 'error',
      autoHideDuration: 5000,
    });
  };

  const onSuccess = (message) => {
    enqueueSnackbar(message, {
      variant: 'success',
      autoHideDuration: 3000,
    });
  };

  return (
    <ViewVendor
      id={id}
      onError={onError}
      onSuccess={onSuccess}
    />
  );
};

const ViewVendorIndex = (props) => {
  const snackbarAction = (snackbarId) => (
    <IconButton onClick={() => closeSnackbar(snackbarId)}>
      <Icon icon="mdi:close" width={25} />
    </IconButton>
  );

  return (
    <SnackbarProvider
      maxSnack={7}
      autoHideDuration={5000}
      preventDuplicate
      action={snackbarAction}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <ViewVendorContent {...props} />
    </SnackbarProvider>
  );
};

export default ViewVendorIndex;