'use client';

import React from 'react';
import SimpleDebitNoteList from './SimpleDebitNoteList';
import AppSnackbar from '@/components/shared/AppSnackbar';
import { usePurchaseReturnListHandler } from './handler';

const PurchaseReturnListIndex = ({
  initialDebitNotes = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialErrorMessage = '',
}) => {
  const handler = usePurchaseReturnListHandler({
    initialDebitNotes,
    initialPagination,
    initialErrorMessage,
  });

  return (
    <>
      <SimpleDebitNoteList
        debitNotes={handler.debitNotes}
        loading={handler.loading}
        pagination={handler.pagination}
        sortBy={handler.sortBy}
        sortDirection={handler.sortDirection}
        searchTerm={handler.searchTerm}
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
      />

      <AppSnackbar
        open={handler.snackbar.open}
        message={handler.snackbar.message}
        severity={handler.snackbar.severity}
        onClose={handler.closeSnackbar}
        autoHideDuration={6000}
      />
    </>
  );
};

export default PurchaseReturnListIndex;