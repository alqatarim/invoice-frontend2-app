'use client';

import React from 'react';
import AppSnackbar from '@/components/shared/AppSnackbar';
import ManualEntriesView from '../ManualEntriesView';
import { useManualEntriesHandler } from './handler';

const ManualEntriesIndex = ({
  type = 'journal',
  initialEntries = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialAccountOptions = [],
  initialErrorMessage = '',
}) => {
  const handler = useManualEntriesHandler({
    type,
    initialEntries,
    initialPagination,
    initialErrorMessage,
  });

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

      <AppSnackbar
        open={handler.snackbar.open}
        message={handler.snackbar.message}
        severity={handler.snackbar.severity}
        onClose={handler.closeSnackbar}
      />
    </>
  );
};

export default ManualEntriesIndex;
