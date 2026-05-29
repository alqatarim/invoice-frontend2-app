'use client';

import React, { useEffect } from 'react';
import { IconButton } from '@mui/material';
import { Icon } from '@iconify/react';
import { SnackbarProvider, closeSnackbar as closeNotistackSnackbar, useSnackbar } from 'notistack';
import ManualEntriesView from '../ManualEntriesView';
import { useManualEntriesHandler } from './handler';

const ManualEntriesContent = ({
  type = 'journal',
  initialEntries = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialAccountOptions = [],
  initialErrorMessage = '',
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const handler = useManualEntriesHandler({
    type,
    initialEntries,
    initialPagination,
    initialErrorMessage,
  });

  useEffect(() => {
    if (!handler.snackbar.open || !handler.snackbar.message) return;

    enqueueSnackbar(handler.snackbar.message, {
      variant: handler.snackbar.severity || 'info',
    });
    handler.closeSnackbar();
  }, [enqueueSnackbar, handler]);

  return (
    <>
      <ManualEntriesView
        type={type}
        accountOptions={initialAccountOptions}
        entries={handler.entries}
        pagination={handler.pagination}
        loading={handler.loading}
        canView={handler.canView}
        canCreate={handler.canCreate}
        canUpdate={handler.canUpdate}
        dialogOpen={handler.dialogOpen}
        detailsEntry={handler.detailsEntry}
        onSearch={handler.fetchEntries}
        onCreate={handler.handleCreate}
        onReverse={handler.handleReverse}
        onOpenDialog={() => handler.setDialogOpen(true)}
        onCloseDialog={() => handler.setDialogOpen(false)}
        onOpenEntry={handler.setDetailsEntry}
        onCloseEntry={() => handler.setDetailsEntry(null)}
      />

    </>
  );
};

const ManualEntriesIndex = props => {
  const snackbarAction = snackbarId => (
    <IconButton onClick={() => closeNotistackSnackbar(snackbarId)}>
      <Icon icon="mdi:close" width={25} />
    </IconButton>
  );

  return (
    <SnackbarProvider
      maxSnack={7}
      autoHideDuration={5000}
      preventDuplicate
      action={snackbarAction}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <ManualEntriesContent {...props} />
    </SnackbarProvider>
  );
};

export default ManualEntriesIndex;
