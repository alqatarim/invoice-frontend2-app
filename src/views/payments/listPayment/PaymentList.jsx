'use client';

import React, { useMemo } from 'react';
import { Icon } from '@iconify/react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PaymentHead from '@/views/payments/listPayment/paymentHead';
import CustomListTable from '@/components/custom-components/CustomListTable';
import { getPaymentColumns } from './paymentColumns';

const PaymentList = ({
  payments = [],
  pagination = { current: 1, pageSize: 10, total: 0 },
  loading = false,
  permissions = {},
  searchTerm = '',
  sortBy = '',
  sortDirection = 'asc',
  summary = {},
  deleteDialogOpen = false,
  selectedPayment = null,
  onOpenAddDialog,
  onPageChange,
  onPageSizeChange,
  onSortRequest,
  onSearchChange,
  onDelete,
  onView,
  onEdit,
  onSetAsSuccess,
  onSetAsFailed,
  onDeleteDialogClose,
  onDeleteConfirm,
}) => {
  const theme = useTheme();

  const tableColumns = useMemo(
    () =>
      getPaymentColumns({
        theme,
        permissions,
        onDelete,
        onView,
        onEdit,
        onSetAsSuccess,
        onSetAsFailed,
      }),
    [theme, permissions, onDelete, onView, onEdit, onSetAsSuccess, onSetAsFailed]
  );

  const tablePagination = useMemo(
    () => ({
      page: Math.max(0, pagination.current - 1),
      pageSize: pagination.pageSize,
      total: pagination.total,
    }),
    [pagination.current, pagination.pageSize, pagination.total]
  );

  return (
    <div className="flex flex-col gap-5">
      <PaymentHead summary={summary} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <CustomListTable
            addRowButton={
              permissions.canCreate ? (
                <Button
                  onClick={onOpenAddDialog}
                  variant="contained"
                  startIcon={<Icon icon="tabler:plus" />}
                >
                  Add Payment
                </Button>
              ) : null
            }
            columns={tableColumns}
            rows={payments}
            loading={loading}
            pagination={tablePagination}
            onPageChange={onPageChange}
            onRowsPerPageChange={onPageSizeChange}
            onSort={onSortRequest}
            sortBy={sortBy}
            sortDirection={sortDirection}
            noDataText="No payments found"
            rowKey={row => row._id || row.id}
            showSearch
            searchValue={searchTerm}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search payments..."
            onRowClick={permissions.canView ? row => onView(row._id) : undefined}
            enableHover
          />
        </Grid>
      </Grid>

      <Dialog open={deleteDialogOpen} onClose={onDeleteDialogClose}>
        <DialogTitle>Delete Payment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{' '}
            <strong>{selectedPayment?.payment_number || 'this payment'}</strong>? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onDeleteDialogClose} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={onDeleteConfirm}
            color="error"
            variant="contained"
            startIcon={<Icon icon="tabler:trash" />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PaymentList;
