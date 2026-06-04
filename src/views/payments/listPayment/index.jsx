'use client';

import React, { useCallback, useEffect } from 'react';
import { IconButton } from '@mui/material';
import { Icon } from '@iconify/react';
import { SnackbarProvider, closeSnackbar as closeNotistackSnackbar, useSnackbar } from 'notistack';
import PaymentDialog from '@/views/payments/payment';
import PaymentList from './PaymentList';
import { usePaymentListHandler } from './handler';

const PaymentListContent = ({
  initialPayments = [],
  initialPagination,
  initialSummary = {},
  initialPaymentNumber = '',
  initialCustomerOptions = [],
  initialErrorMessage = '',
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const onError = useCallback(
    message => {
      enqueueSnackbar(message, {
        variant: 'error',
        autoHideDuration: 5000,
        preventDuplicate: true,
      });
    },
    [enqueueSnackbar]
  );

  const onSuccess = useCallback(
    message => {
      enqueueSnackbar(message, {
        variant: 'success',
        autoHideDuration: 3000,
      });
    },
    [enqueueSnackbar]
  );

  useEffect(() => {
    if (initialErrorMessage) {
      onError(initialErrorMessage);
    }
  }, [initialErrorMessage, onError]);

  const handler = usePaymentListHandler({
    initialPayments,
    initialPagination,
    initialSummary,
    initialPaymentNumber,
    initialCustomerOptions,
    initialErrorMessage,
    onError,
    onSuccess,
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
      <PaymentList
        payments={handler.payments}
        pagination={handler.pagination}
        loading={handler.loading}
        permissions={handler.permissions}
        searchTerm={handler.searchTerm}
        sortBy={handler.sortBy}
        sortDirection={handler.sortDirection}
        summary={handler.summary}
        deleteDialogOpen={handler.dialogState.deleteOpen}
        selectedPayment={handler.dialogState.selectedPayment}
        onOpenAddDialog={handler.openAddDialog}
        onPageChange={handler.handlePageChange}
        onPageSizeChange={handler.handlePageSizeChange}
        onSortRequest={handler.handleSortRequest}
        onSearchChange={handler.handleSearchInputChange}
        onDelete={handler.openDeleteDialog}
        onView={handler.openViewDialog}
        onEdit={handler.openEditDialog}
        onSetAsSuccess={handler.handleSetAsSuccess}
        onSetAsFailed={handler.handleSetAsFailed}
        onDeleteDialogClose={handler.closeDeleteDialog}
        onDeleteConfirm={handler.handleDeleteConfirm}
      />

      <PaymentDialog
        mode="add"
        open={handler.dialogState.addOpen}
        onClose={handler.closeAddDialog}
        onSave={handler.handleAddPayment}
        paymentNumber={handler.paymentNumber}
        customerOptions={handler.customerOptions}
      />

      <PaymentDialog
        mode="edit"
        open={handler.dialogState.editOpen}
        paymentData={handler.dialogState.selectedPaymentData}
        loading={handler.dialogState.detailsLoading}
        error={handler.dialogState.detailsError}
        onRetry={handler.retryDetailsFetch}
        onClose={handler.closeEditDialog}
        onSave={handler.handleUpdatePayment}
        customerOptions={handler.customerOptions}
      />

      <PaymentDialog
        mode="view"
        open={handler.dialogState.viewOpen}
        paymentData={handler.dialogState.selectedPaymentData}
        loading={handler.dialogState.detailsLoading}
        error={handler.dialogState.detailsError}
        onRetry={handler.retryDetailsFetch}
        onClose={handler.closeViewDialog}
      />
    </>
  );
};

const PaymentListIndex = props => {
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
      <PaymentListContent {...props} />
    </SnackbarProvider>
  );
};

export default PaymentListIndex;
