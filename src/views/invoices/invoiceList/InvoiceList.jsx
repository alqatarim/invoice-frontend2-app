import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { useTheme } from '@mui/material/styles';
import { usePermission } from '@/Auth/usePermission';

import InvoiceHead from '@/views/invoices/invoiceList/invoiceHead';
import CustomListTable from '@/components/custom-components/CustomListTable';
import AppSnackbar from '@/components/shared/AppSnackbar';
import { useInvoiceListHandler } from './handler';
import { getInvoiceColumns } from './invoiceColumns';

/**
 * InvoiceList Component
 */
const InvoiceList = ({
  initialInvoices = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialCardCounts = {},
  initialTab = 'ALL',
  initialFilters = {},
  initialSortBy = '',
  initialSortDirection = 'asc',
  initialCustomers = [],
}) => {
  const theme = useTheme();
  const router = useRouter();

  const canCreate = usePermission('invoice', 'create');
  const canUpdate = usePermission('invoice', 'update');
  const canView = usePermission('invoice', 'view');
  const canDelete = usePermission('invoice', 'delete');

  const stablePermissions = useMemo(
    () => ({
      canCreate,
      canUpdate,
      canView,
      canDelete,
    }),
    [canCreate, canUpdate, canView, canDelete]
  );

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const onErrorRef = useRef();
  const onSuccessRef = useRef();
  onErrorRef.current = (msg) => setSnackbar({ open: true, message: msg, severity: 'error' });
  onSuccessRef.current = (msg) => setSnackbar({ open: true, message: msg, severity: 'success' });

  const onError = useCallback((msg) => onErrorRef.current(msg), []);
  const onSuccess = useCallback((msg) => onSuccessRef.current(msg), []);

  // Initialize handlers with column definitions
  const columns = useMemo(
    () => getInvoiceColumns({ theme, permissions: stablePermissions }),
    [theme, stablePermissions]
  );

  const handlers = useInvoiceListHandler({
    initialInvoices,
    initialPagination,
    initialTab,
    initialFilters,
    initialSortBy,
    initialSortDirection,
    initialColumns: columns,
    initialCustomers,
    onError,
    onSuccess,
  });

  // Build table columns with action handlers
  const tableColumns = useMemo(
    () =>
      (columns || [])
        .filter((col) => col.visible !== false)
        .map((col) => ({
          ...col,
          renderCell: col.renderCell
            ? (row) =>
                col.renderCell(row, {
                  ...handlers,
                  permissions: stablePermissions,
                })
            : undefined,
        })),
    [columns, handlers, stablePermissions]
  );

  return (
    <div className='flex flex-col gap-5'>
      {/* Header and Stats */}
      <InvoiceHead
        invoiceListData={initialCardCounts}
      />

      {/* Main Invoice Table */}
      <CustomListTable
        addRowButton={
          stablePermissions.canCreate && (
            <Button
              component={Link}
              href="/invoices/add"
              variant="contained"
              startIcon={<Icon icon="tabler:plus" />}
            >
              New Invoice
            </Button>
          )
        }
        showSearch
        searchValue={handlers.searchTerm || ''}
        onSearchChange={handlers.handleSearchInputChange}
        searchPlaceholder="Search invoices..."
        columns={tableColumns}
        rows={handlers.invoices}
        loading={handlers.loading}
        pagination={{
          page: handlers.pagination.current - 1,
          pageSize: handlers.pagination.pageSize,
          total: handlers.pagination.total
        }}
        onPageChange={handlers.handlePageChange}
        onRowsPerPageChange={handlers.handlePageSizeChange}
        onSort={handlers.handleSortRequest}
        sortBy={handlers.sortBy}
        sortDirection={handlers.sortDirection}
        noDataText="No invoices found."
        rowKey={(row) => row._id || row.id}
        onRowClick={
          stablePermissions.canView
            ? (row) => router.push(`/invoices/invoice-view/${row._id || row.id}`)
            : undefined
        }
      />

      {/* Snackbar */}
      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleSnackbarClose}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      />

      {/* Convert to Sales Return Dialog */}
      <Dialog
        open={handlers.convertDialogOpen}
        onClose={handlers.closeConvertDialog}
        aria-labelledby="convert-dialog-title"
      >
        <DialogTitle id="convert-dialog-title">Convert to Sales Return</DialogTitle>
        <DialogContent>
          Are you sure you want to convert this invoice to a sales return?
        </DialogContent>
        <DialogActions>
          <Button onClick={handlers.closeConvertDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handlers.confirmConvertToSalesReturn} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default InvoiceList;