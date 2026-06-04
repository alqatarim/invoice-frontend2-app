import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import {
  Button,
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
import { usePermission } from '@/Auth/usePermission';
import { useSnackbar } from 'notistack';

import PurchaseOrderHead from '@/views/purchase-orders/listOrder/PurchaseOrderHead';
import CustomListTable from '@/components/custom-components/CustomListTable';
import { usePurchaseOrderListHandlers } from './handler';
import { getPurchaseOrderColumns } from './purchaseOrderColumns';

const mergeSavedColumnState = (baseColumns, savedColumns = []) => {
  if (!Array.isArray(savedColumns)) return baseColumns;

  return baseColumns.map(column => {
    const savedColumn = savedColumns.find(saved => saved.key === column.key);

    return {
      ...column,
      visible: savedColumn?.visible ?? column.visible,
    };
  });
};

/**
 * Simplified PurchaseOrderList Component - matches vendor list structure
 */
const PurchaseOrderList = ({
  initialPurchaseOrders,
  initialPagination,
  initialCardCounts = {},
  initialErrorMessage = ''
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  // Permissions
  const canCreate = usePermission('purchase_order', 'create');
  const canUpdate = usePermission('purchase_order', 'update');
  const canView = usePermission('purchase_order', 'view');
  const canDelete = usePermission('purchase_order', 'delete');
  const permissions = useMemo(
    () => ({
      canCreate,
      canUpdate,
      canView,
      canDelete,
    }),
    [canCreate, canUpdate, canView, canDelete]
  );

  useEffect(() => {
    if (initialErrorMessage) {
      enqueueSnackbar(initialErrorMessage, { variant: 'error' });
    }
  }, [enqueueSnackbar, initialErrorMessage]);

  // Notification handlers
  const onError = React.useCallback(msg => {
    enqueueSnackbar(msg, { variant: 'error' });
  }, [enqueueSnackbar]);

  const onSuccess = React.useCallback(msg => {
    enqueueSnackbar(msg, { variant: 'success' });
  }, [enqueueSnackbar]);

  // Initialize simplified handlers
  const handlers = usePurchaseOrderListHandlers({
    initialPurchaseOrders,
    initialPagination,
    initialCardCounts,
    onError,
    onSuccess,
  });

  // Column management
  const columns = useMemo(() => {
    if (!theme || !permissions) return [];
    return getPurchaseOrderColumns({ theme, permissions });
  }, [theme, permissions]);

  const [columnsState, setColumns] = useState(() => {
    if (typeof window !== 'undefined' && columns.length > 0) {
      const saved = localStorage.getItem('purchaseOrderVisibleColumns');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return Array.isArray(parsed) ? mergeSavedColumnState(columns, parsed) : columns;
        } catch (e) {
          console.warn('Failed to parse saved column preferences:', e);
        }
      }
    }
    return columns;
  });

  const [manageColumnsOpen, setManageColumnsOpen] = useState(false);

  React.useEffect(() => {
    if (columns.length > 0) {
      setColumns(prevColumns => mergeSavedColumnState(columns, prevColumns));
    }
  }, [columns]);

  const handleColumnCheckboxChange = React.useCallback((columnKey, checked) => {
    setColumns(prev => prev.map(col =>
      col.key === columnKey ? { ...col, visible: checked } : col
    ));
  }, []);

  const handleSaveColumns = React.useCallback(() => {
    setManageColumnsOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('purchaseOrderVisibleColumns', JSON.stringify(columnsState));
    }
  }, [columnsState]);

  // Table columns
  const tableColumns = useMemo(() => {
    const cellHandlers = {
      handleDeleteClick: handlers.handleDeleteClick,
      handleView: handlers.handleView,
      handleEdit: handlers.handleEdit,
      handleClone: handlers.handleClone,
      handleStatusChange: handlers.handleStatusChange,
      handleSubmitForApproval: handlers.handleSubmitForApproval,
      handlePrintDownload: handlers.handlePrintDownload,
      openConvertDialog: handlers.openConvertDialog,
      permissions,
      pagination: handlers.pagination,
    };

    return columnsState
      .filter(col => col.visible)
      .map(col => ({
        ...col,
        renderCell: col.renderCell ? (row, index) => col.renderCell(row, cellHandlers, index) : undefined
      }));
  }, [columnsState, handlers, permissions]);

  const tablePagination = useMemo(() => ({
    page: handlers.pagination.current - 1,
    pageSize: handlers.pagination.pageSize,
    total: handlers.pagination.total
  }), [handlers.pagination]);

  return (
    <div className='flex flex-col gap-5'>
      <PurchaseOrderHead
        purchaseOrderStatsData={handlers.cardCounts}
        isLoading={handlers.loading}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <CustomListTable
            addRowButton={
              permissions.canCreate && (
                <Button
                  component={Link}
                  href="/purchase-orders/order-add"
                  variant="contained"
                  startIcon={<Icon icon="tabler:plus" />}
                >
                  New Purchase Order
                </Button>
              )
            }
            columns={tableColumns}
            rows={handlers.purchaseOrders}
            loading={handlers.loading}
            pagination={tablePagination}
            onPageChange={(page) => handlers.handlePageChange(page)}
            onRowsPerPageChange={(size) => handlers.handlePageSizeChange(size)}
            onSort={(key, direction) => handlers.handleSortRequest(key, direction)}
            sortBy={handlers.sortBy}
            sortDirection={handlers.sortDirection}
            noDataText="No purchase orders found"
            rowKey={(row) => row._id || row.id}
            showSearch={true}
            searchValue={handlers.searchTerm || ''}
            onSearchChange={handlers.handleSearchInputChange}
            searchPlaceholder="Search purchase orders..."
            onRowClick={
              permissions.canView
                ? (row) => handlers.handleView(row._id)
                : undefined
            }
            enableHover
          />
        </Grid>
      </Grid>

      <Dialog
        open={manageColumnsOpen}
        onClose={() => setManageColumnsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Manage Columns</DialogTitle>
        <DialogContent>
          <FormGroup>
            {columnsState.map((column) => (
              <FormControlLabel
                key={column.key}
                control={
                  <Checkbox
                    checked={column.visible}
                    onChange={(e) => handleColumnCheckboxChange(column.key, e.target.checked)}
                  />
                }
                label={column.label}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManageColumnsOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveColumns} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

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

      <Dialog
        open={handlers.deleteDialogOpen}
        onClose={handlers.handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Delete Purchase Order</DialogTitle>
        <DialogContent>
          Are you sure you want to delete purchase order{' '}
          {handlers.selectedPurchaseOrder?.purchaseOrderId || ''}?
        </DialogContent>
        <DialogActions>
          <Button onClick={handlers.handleDeleteCancel} color="secondary">
            Cancel
          </Button>
          <Button onClick={handlers.handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PurchaseOrderList;