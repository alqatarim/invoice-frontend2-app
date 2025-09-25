'use client';

import React, { useState, useMemo, useCallback, memo } from 'react';
import { Icon } from '@iconify/react';
import {
  Box,
  Typography,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSession } from 'next-auth/react';
import { usePermission } from '@/Auth/usePermission';
import { usePaymentListHandlers } from '@/handlers/payments/usePaymentListHandlers';
import PaymentHead from './paymentHead';
import PaymentFilter from './paymentFilter';
import CustomListTable from '@/components/custom-components/CustomListTable';
import { paymentColumns } from './paymentColumns';
import AddPaymentDialog from '@/views/payments/addPayment/AddPaymentDialog';
import EditPaymentDialog from '@/views/payments/editPayment/EditPaymentDialog';
import ViewPaymentDialog from '@/views/payments/viewPayment/ViewPaymentDialog';
import { addPayment, updatePayment } from '@/app/(dashboard)/payments/actions';

const PaymentList = ({
  initialPayments = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialCustomerOptions = [],
}) => {
  const theme = useTheme();
  const { data: session } = useSession();

  // Permissions
  const permissions = {
    canCreate: usePermission('payment', 'create'),
    canUpdate: usePermission('payment', 'update'),
    canView: usePermission('payment', 'view'),
    canDelete: usePermission('payment', 'delete'),
  };

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Dialog states
  const [dialogStates, setDialogStates] = useState({
    add: false,
    edit: false,
    view: false,
    editPaymentId: null,
    viewPaymentId: null,
  });

  // Notification handlers
  const onError = useCallback(msg => {
    setSnackbar({ open: true, message: msg, severity: 'error' });
  }, []);

  const onSuccess = useCallback(msg => {
    setSnackbar({ open: true, message: msg, severity: 'success' });
  }, []);

  // Dialog handlers
  const handleOpenAddDialog = useCallback(() => {
    setDialogStates(prev => ({ ...prev, add: true }));
  }, []);

  const handleCloseAddDialog = useCallback(() => {
    setDialogStates(prev => ({ ...prev, add: false }));
  }, []);

  const handleOpenEditDialog = useCallback((paymentId) => {
    setDialogStates(prev => ({ ...prev, edit: true, editPaymentId: paymentId }));
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setDialogStates(prev => ({ ...prev, edit: false, editPaymentId: null }));
  }, []);

  const handleOpenViewDialog = useCallback((paymentId) => {
    setDialogStates(prev => ({ ...prev, view: true, viewPaymentId: paymentId }));
  }, []);

  const handleCloseViewDialog = useCallback(() => {
    setDialogStates(prev => ({ ...prev, view: false, viewPaymentId: null }));
  }, []);

  // CRUD operation handlers
  const handleAddPayment = useCallback(async (formData) => {
    try {
      onSuccess('Adding payment...');

      const response = await addPayment(formData);

      if (!response.success) {
        const errorMessage = response.error?.message || response.message || 'Failed to add payment';
        onError(errorMessage);
        return { success: false, message: errorMessage };
      }

      onSuccess('Payment added successfully!');
      // Refresh the list to show the new payment
      try {
        await handlers.refreshData();
      } catch (refreshError) {
        console.warn('Failed to refresh payment list after add:', refreshError);
        // Continue anyway - the operation was successful
      }
      return response;
    } catch (error) {
      const errorMessage = error.message || 'Failed to add payment';
      onError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [onSuccess, onError]);

  const handleUpdatePayment = useCallback(async (paymentId, formData) => {
    try {
      onSuccess('Updating payment...');

      const response = await updatePayment(paymentId, formData);

      if (!response.success) {
        const errorMessage = response.error?.message || response.message || 'Failed to update payment';
        onError(errorMessage);
        return { success: false, message: errorMessage };
      }

      onSuccess('Payment updated successfully!');
      // Refresh the list to show the updated payment
      try {
        await handlers.refreshData();
      } catch (refreshError) {
        console.warn('Failed to refresh payment list after update:', refreshError);
        // Continue anyway - the operation was successful
      }
      return response;
    } catch (error) {
      const errorMessage = error.message || 'Failed to update payment';
      onError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [onSuccess, onError]);

  const handlers = usePaymentListHandlers({
    initialPayments,
    initialPagination,
    initialCustomerOptions,
    onSuccess,
    onError,
    // Pass dialog handlers for actions
    onView: handleOpenViewDialog,
    onEdit: handleOpenEditDialog,
  });

  const tableColumns = useMemo(() => {
    const columns = paymentColumns({
      handleView: handlers.handleView,
      handleEdit: handlers.handleEdit,
      handleDelete: handlers.handleDelete,
    });

    // Create cell handlers for table columns
    const cellHandlers = {
      handleDelete: handlers.handleDelete,
      handleView: handlers.handleView,
      handleEdit: handlers.handleEdit,
      permissions: permissions,
      pagination: handlers.pagination,
    };

    return columns.map(col => ({
      ...col,
      renderCell: col.renderCell ? (row, index) => col.renderCell(row, cellHandlers, index) : undefined
    }));
  }, [handlers, permissions]);

  return (
    <Box className="flex flex-col gap-4 p-4">
      <Box className="flex justify-between items-center">
        <Typography variant="h5" color="primary">
          Payments
        </Typography>
        {permissions.canCreate && (
          <Button
            onClick={handleOpenAddDialog}
            variant="contained"
            startIcon={<Icon icon="tabler:plus" />}
          >
            Add Payment
          </Button>
        )}
      </Box>

      <PaymentHead
        onFilterToggle={handlers.handleFilterToggle}
        isFilterApplied={handlers.isFilterApplied()}
        filterCount={handlers.getFilterCount()}
        onFilterReset={handlers.handleFilterReset}
      />

      <CustomListTable
        columns={tableColumns}
        rows={handlers.payments || []}
        loading={handlers.loading}
        pagination={{
          page: handlers.pagination.current - 1, // Zero-indexed for MUI
          pageSize: handlers.pagination.pageSize,
          total: handlers.pagination.total,
        }}
        onPageChange={handlers.handlePageChange}
        onRowsPerPageChange={handlers.handlePageSizeChange}
        onSort={handlers.handleSortRequest}
        sortBy={handlers.sortBy}
        sortDirection={handlers.sortDirection}
        rowKey={(row, index) => row?._id || row?.id || `payment-${index}`}
        noDataText="No payments found"
      />

      <PaymentFilter
        open={handlers.filterOpen}
        onClose={handlers.handleFilterToggle}
        filterValues={handlers.filterValues}
        onFilterChange={handlers.handleFilterValueChange}
        onApply={handlers.handleFilterApply}
        onReset={handlers.handleFilterReset}
        customerOptions={handlers.customerOptions || []}
        customerSearchLoading={handlers.customerSearchLoading}
        onCustomerSearch={handlers.handleCustomerSearch}
      />

      {/* Add Payment Dialog */}
      <AddPaymentDialog
        open={dialogStates.add}
        onClose={handleCloseAddDialog}
        onSave={handleAddPayment}
        paymentNumber={"PAY-" + Date.now()} // Generate payment number
        customerOptions={handlers.customerOptions || []}
      />

      {/* Edit Payment Dialog */}
      <EditPaymentDialog
        open={dialogStates.edit}
        paymentId={dialogStates.editPaymentId}
        onClose={handleCloseEditDialog}
        onSave={handleUpdatePayment}
        customerOptions={handlers.customerOptions || []}
      />

      {/* View Payment Dialog */}
      <ViewPaymentDialog
        open={dialogStates.view}
        paymentId={dialogStates.viewPaymentId}
        onClose={handleCloseViewDialog}
        onEdit={handleOpenEditDialog}
        onError={onError}
        onSuccess={onSuccess}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={(_, reason) => reason !== 'clickaway' && setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentList;