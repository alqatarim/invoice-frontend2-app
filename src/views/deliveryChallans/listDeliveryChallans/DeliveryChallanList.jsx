'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import {
  Card,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Grid,
} from '@mui/material';

import { useTheme } from '@mui/material/styles';
import { useSession } from 'next-auth/react';
import { usePermission } from '@/Auth/usePermission';

import DeliveryChallanHead from '@/views/deliveryChallans/listDeliveryChallans/deliveryChallansHead';
import DeliveryChallanFilter from '@/views/deliveryChallans/listDeliveryChallans/deliveryChallansFilter';
import CustomListTable from '@/components/custom-components/CustomListTable';
import { useDeliveryChallanListHandlers } from '@/handlers/deliveryChallans/useDeliveryChallanListHandlers';
import { formatCurrency } from '@/utils/currencyUtils';
import { getDeliveryChallanColumns } from './deliveryChallansColumns';

/**
 * DeliveryChallanList Component
 */
const DeliveryChallanList = ({
  initialDeliveryChallans = [],
  pagination: initialPagination = { current: 1, pageSize: 10, total: 0 },
  cardCounts: initialCardCounts = {},
  tab: initialTab = 'ALL',
  filters: initialFilters = {},
  sortBy: initialSortBy = '',
  sortDirection: initialSortDirection = 'asc',
  initialCustomers = [],
}) => {
  const theme = useTheme();
  const { data: session } = useSession();

  // Stable permissions object to prevent infinite rerenders
  const permissions = useMemo(() => ({
    canCreate: usePermission('delivery_challan', 'create'),
    canUpdate: usePermission('delivery_challan', 'update'),
    canView: usePermission('delivery_challan', 'view'),
    canDelete: usePermission('delivery_challan', 'delete'),
  }), [
    usePermission('delivery_challan', 'create'),
    usePermission('delivery_challan', 'update'),
    usePermission('delivery_challan', 'view'),
    usePermission('delivery_challan', 'delete')
  ]);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleSnackbarClose = useCallback((event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  // Notification handlers - memoized to prevent recreating
  const onError = useCallback((msg) => setSnackbar({ open: true, message: msg, severity: 'error' }), []);
  const onSuccess = useCallback((msg) => setSnackbar({ open: true, message: msg, severity: 'success' }), []);

  // Stable column definitions - only recreate when theme or permissions change
  const columns = useMemo(() => getDeliveryChallanColumns({ theme, permissions }), [theme, permissions]);

  // Stable handler options - prevent recreation
  const handlerOptions = useMemo(() => ({
    initialDeliveryChallans,
    initialPagination,
    initialTab,
    initialFilters,
    initialSortBy,
    initialSortDirection,
    initialColumns: columns,
    initialCustomers,
    permissions,
    onError,
    onSuccess,
  }), [
    initialDeliveryChallans,
    initialPagination,
    initialTab,
    JSON.stringify(initialFilters),
    initialSortBy,
    initialSortDirection,
    columns,
    initialCustomers,
    permissions,
    onError,
    onSuccess,
  ]);

  const handlers = useDeliveryChallanListHandlers(handlerOptions);

  // Column actions - memoized to prevent recreation
  const columnActions = useMemo(() => ({
    open: () => handlers.handleManageColumnsOpen(),
    close: () => handlers.handleManageColumnsClose(),
    save: () => handlers.handleManageColumnsSave(),
  }), [handlers.handleManageColumnsOpen, handlers.handleManageColumnsClose, handlers.handleManageColumnsSave]);

  // Stable currency symbol
  const currencySymbol = useMemo(() =>
    formatCurrency(0).replace(/\d|\.|,/g, '').trim(),
    []
  );

  return (
    <div className='flex flex-col gap-5'>
      {/* Header and Stats */}
      <DeliveryChallanHead
        deliveryChallanListData={initialCardCounts}
        currencyData={currencySymbol}
        isLoading={handlers.loading}
      />

      <Grid container spacing={3}>
        {/* New Delivery Challan Button */}
        {permissions.canCreate && (
          <Grid item xs={12}>
            <div className="flex justify-end">
              <Button
                component={Link}
                href="/deliveryChallans/deliveryChallans-add"
                variant="contained"
                startIcon={<Icon icon="tabler:plus" />}
              >
                New Delivery Challan
              </Button>
            </div>
          </Grid>
        )}

        {/* Filter Component */}
        <Grid item xs={12}>
          <DeliveryChallanFilter
            onChange={handlers.handleFilterChange}
            onApply={handlers.applyFilters}
            onReset={handlers.resetFilters}
            customerOptions={handlers.customerOptions}
            values={handlers.filters}
            onManageColumns={columnActions.open}
            onCustomerSearch={handlers.handleCustomerSearch}
          />
        </Grid>

        {/* Delivery Challan Table */}
        <Grid item xs={12}>
          <Card>
            <CustomListTable
              columns={handlers.tableColumns}
              rows={handlers.deliveryChallans}
              loading={handlers.loading}
              pagination={{
                page: handlers.pagination.current - 1,
                pageSize: handlers.pagination.pageSize,
                total: handlers.pagination.total
              }}
              onPageChange={handlers.handlePageChange}
              onRowsPerPageChange={handlers.handlePageSizeChange}
              onSort={handlers.handleSort}
              sortBy={handlers.sortBy}
              sortDirection={handlers.sortDirection}
              noDataText="No delivery challans found."
              rowKey={(row) => row._id || row.id}
            />
          </Card>
        </Grid>
      </Grid>

      {/* Manage Columns Dialog */}
      <Dialog open={handlers.manageColumnsOpen} onClose={columnActions.close}>
        <DialogTitle>Select Columns</DialogTitle>
        <DialogContent>
          <FormGroup>
            {handlers.availableColumns.map((column) => (
              <FormControlLabel
                key={column.key}
                control={
                  <Checkbox
                    checked={column.visible}
                    onChange={(e) => handlers.handleColumnCheckboxChange(column.key, e.target.checked)}
                  />
                }
                label={column.label}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={columnActions.close}>Cancel</Button>
          <Button onClick={columnActions.save} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} className="w-full">
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Convert to Invoice Dialog */}
      <Dialog
        open={handlers.convertDialogOpen}
        onClose={handlers.closeConvertDialog}
        aria-labelledby="convert-dialog-title"
      >
        <DialogTitle id="convert-dialog-title">Convert to Invoice</DialogTitle>
        <DialogContent>
          Are you sure you want to convert this delivery challan to an invoice?
        </DialogContent>
        <DialogActions>
          <Button onClick={handlers.closeConvertDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handlers.confirmConvertToInvoice} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DeliveryChallanList;