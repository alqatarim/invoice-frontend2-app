import React, { useState, useMemo } from 'react';
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
import { useSearchParams } from 'next/navigation';

import PurchaseOrderHead from '@/views/purchase-orders/listOrder/PurchaseOrderHead';
import PurchaseOrderFilter from '@/views/purchase-orders/listOrder/PurchaseOrderFilter';
import CustomListTable from '@/components/custom-components/CustomListTable';
import { usePurchaseOrderListHandlers } from '@/handlers/purchaseOrders/usePurchaseOrderListHandlers';
import { formatCurrency } from '@/utils/currencyUtils';
import { getPurchaseOrderColumns } from './purchaseOrderColumns';

/**
 * PurchaseOrderList Component
 */
const PurchaseOrderList = ({
  initialPurchaseOrders = [],
  pagination: initialPagination = { current: 1, pageSize: 10, total: 0 },
  cardCounts: initialCardCounts = {},
  tab: initialTab = 'ALL',
  filters: initialFilters = {},
  sortBy: initialSortBy = '',
  sortDirection: initialSortDirection = 'asc',
  initialVendors = [],
}) => {
  const theme = useTheme();
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  // Permissions
  const permissions = {
    canCreate: usePermission('purchase_order', 'create'),
    canUpdate: usePermission('purchase_order', 'update'),
    canView: usePermission('purchase_order', 'view'),
    canDelete: usePermission('purchase_order', 'delete'),
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
  const columns = useMemo(() => getPurchaseOrderColumns({ theme, permissions }), [theme, permissions]);

  const handlers = usePurchaseOrderListHandlers({
    initialPurchaseOrders,
    initialPagination,
    initialTab,
    initialFilters,
    initialSortBy,
    initialSortDirection,
    initialColumns: columns,
    initialVendors,
    onError,
    onSuccess,
  });

  // Column state management
  const [columnsState, setColumns] = useState(columns);

  // Column actions
  const columnActions = {
    open: () => handlers.handleManageColumnsOpen(),
    close: () => handlers.handleManageColumnsClose(),
    save: () => handlers.handleManageColumnsSave(setColumns),
  };

  // Build table columns with action handlers
  const tableColumns = useMemo(() =>
    columnsState.map(col => ({
      ...col,
      renderCell: col.renderCell ?
        (row) => col.renderCell(row, {
          ...handlers,
          permissions,
        }) : undefined
    })),
    [columnsState, handlers, permissions]
  );

  return (
    <div className='flex flex-col gap-5'>
      {/* Header and Stats */}
      <PurchaseOrderHead
        purchaseOrderListData={initialCardCounts}
        currencyData={formatCurrency(0).replace(/\d|\.|,/g, '').trim()}
        isLoading={handlers.loading}
      />

      <Grid container spacing={3}>
        {/* New Purchase Order Button */}
        {permissions.canCreate && (
          <Grid item xs={12}>
            <div className="flex justify-end">
              <Button
                component={Link}
                href="/purchase-orders/order-add"
                variant="contained"
                startIcon={<Icon icon="tabler:plus" />}
              >
                New Purchase Order
              </Button>
            </div>
          </Grid>
        )}

        {/* Filter Component */}
        <Grid item xs={12}>
          <PurchaseOrderFilter
            onChange={handlers.handleFilterValueChange}
            onApply={handlers.handleFilterApply}
            onReset={handlers.handleFilterReset}
            vendorOptions={handlers.vendorOptions}
            purchaseOrderOptions={handlers.purchaseOrderOptions}
            values={handlers.filterValues}
            tab={handlers.filterValues.status || []}
            onTabChange={handlers.handleTabChange}
            onManageColumns={columnActions.open}
          />
        </Grid>

        {/* Purchase Order Table */}
        <Grid item xs={12}>
          <Card>
            <CustomListTable
              columns={tableColumns}
              rows={handlers.purchaseOrders}
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
              noDataText="No purchase orders found."
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

      {/* Convert to Purchase Dialog */}
      <Dialog
        open={handlers.convertDialogOpen}
        onClose={handlers.closeConvertDialog}
        aria-labelledby="convert-dialog-title"
      >
        <DialogTitle id="convert-dialog-title">Convert to Purchase</DialogTitle>
        <DialogContent>
          Are you sure you want to convert this purchase order to a purchase?
        </DialogContent>
        <DialogActions>
          <Button onClick={handlers.closeConvertDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handlers.confirmConvertToPurchase} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PurchaseOrderList;