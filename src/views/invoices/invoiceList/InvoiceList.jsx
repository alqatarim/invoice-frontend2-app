import React, { useState, useMemo } from 'react';
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
import { useInvoiceListHandlers } from '@/handlers/invoices/useInvoiceListHandlers';
import { getInvoiceColumns } from './invoiceColumns';

/**
 * InvoiceList Component
 */
const InvoiceList = ({
  initialInvoices = [],
  pagination: initialPagination = { current: 1, pageSize: 10, total: 0 },
  cardCounts: initialCardCounts = {},
  tab: initialTab = 'ALL',
  filters: initialFilters = {},
  sortBy: initialSortBy = '',
  sortDirection: initialSortDirection = 'asc',
  initialCustomers = [],
}) => {
  const theme = useTheme();
  const router = useRouter();

  // Permissions
  const permissions = {
    canCreate: usePermission('invoice', 'create'),
    canUpdate: usePermission('invoice', 'update'),
    canView: usePermission('invoice', 'view'),
    canDelete: usePermission('invoice', 'delete'),
  };

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

  // Notification handlers
  const onError = msg => setSnackbar({ open: true, message: msg, severity: 'error' });
  const onSuccess = msg => setSnackbar({ open: true, message: msg, severity: 'success' });

  // Initialize handlers with column definitions
  const columns = useMemo(() => getInvoiceColumns({ theme, permissions }), [theme, permissions]);

  const handlers = useInvoiceListHandlers({
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
  const tableColumns = useMemo(() =>
    (columns || [])
      .filter(col => col.visible !== false)
      .map(col => ({
        ...col,
        renderCell: col.renderCell ?
          (row) => col.renderCell(row, {
            ...handlers,
            permissions,
          }) : undefined
      })),
    [columns, handlers, permissions]
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
          permissions.canCreate && (
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
          permissions.canView
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