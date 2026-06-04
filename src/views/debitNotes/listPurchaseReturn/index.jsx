'use client';

import React, { useEffect } from 'react';
import { IconButton } from '@mui/material';
import { Icon } from '@iconify/react';
import { SnackbarProvider, closeSnackbar as closeNotistackSnackbar, useSnackbar } from 'notistack';
import SimpleDebitNoteList from './SimpleDebitNoteList';
import { usePurchaseReturnListHandler } from './handler';

const PurchaseReturnListContent = ({
  initialDebitNotes = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialSummary = {},
  initialErrorMessage = '',
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const handler = usePurchaseReturnListHandler({
    initialDebitNotes,
    initialPagination,
    initialSummary,
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
      <SimpleDebitNoteList
        debitNotes={handler.debitNotes}
        loading={handler.loading}
        pagination={handler.pagination}
        sortBy={handler.sortBy}
        sortDirection={handler.sortDirection}
        searchTerm={handler.searchTerm}
        summary={handler.summary}
        permissions={handler.permissions}
        tableColumns={handler.tableColumns}
        manageColumnsOpen={handler.manageColumnsOpen}
        columnsState={handler.columnsState}
        onPageChange={handler.handlePageChange}
        onPageSizeChange={handler.handlePageSizeChange}
        onSortRequest={handler.handleSortRequest}
        onSearchChange={handler.handleSearchInputChange}
        onView={handler.handleView}
        onCloseManageColumns={handler.closeManageColumns}
        onColumnCheckboxChange={handler.handleColumnCheckboxChange}
        onSaveColumns={handler.handleSaveColumns}
        deleteDialogOpen={handler.deleteDialogOpen}
        selectedDebitNote={handler.selectedDebitNote}
        onDeleteConfirm={handler.handleDeleteConfirm}
        onDeleteCancel={handler.handleDeleteCancel}
      />
    </>
  );
};

const PurchaseReturnListIndex = props => {
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
      <PurchaseReturnListContent {...props} />
    </SnackbarProvider>
  );
};

export default PurchaseReturnListIndex;