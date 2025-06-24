'use client';

import React, { useState, useMemo } from 'react';
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
  Box,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSession } from 'next-auth/react';
import { usePermission } from '@/Auth/usePermission';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';

import InventoryHead from '@/views/inventory/inventoryList/inventoryHead';
import InventoryFilter from '@/views/inventory/inventoryList/inventoryFilter';
import CustomListTable from '@/components/custom-components/CustomListTable';
import { useInventoryListHandlers } from '@/handlers/inventory/useInventoryListHandlers';
import { getInventoryColumns } from './inventoryColumns';

/**
 * InventoryList Component
 */
const InventoryList = ({
  initialInventory = [],
  pagination: initialPagination = { current: 1, pageSize: 10, total: 0 },
  cardCounts: initialCardCounts = {},
  filters: initialFilters = {},
  sortBy: initialSortBy = '',
  sortDirection: initialSortDirection = 'asc',
}) => {
  const theme = useTheme();
  const { data: session } = useSession();

  // Permissions
  const permissions = {
    canCreate: usePermission('inventory', 'create'),
    canUpdate: usePermission('inventory', 'update'),
    canView: usePermission('inventory', 'view'),
    canDelete: usePermission('inventory', 'delete'),
  };

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Stock management dialog state
  const [stockDialog, setStockDialog] = useState({
    open: false,
    type: null, // 'add' or 'remove'
    item: null,
    data: {
      quantity: '',
      notes: '',
    },
  });

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Notification handlers
  const onError = msg => setSnackbar({ open: true, message: msg, severity: 'error' });
  const onSuccess = msg => setSnackbar({ open: true, message: msg, severity: 'success' });

  // Initialize handlers with column definitions
  const columns = useMemo(() => getInventoryColumns({ permissions }), [permissions]);

  const handlers = useInventoryListHandlers({
    initialInventory,
    initialPagination,
    initialFilters,
    initialSortBy,
    initialSortDirection,
    initialColumns: columns,
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

  // Stock dialog handlers
  const openStockDialog = (type, item) => {
    setStockDialog({
      open: true,
      type,
      item,
      data: {
        quantity: '',
        notes: '',
      },
    });
  };

  const closeStockDialog = () => {
    setStockDialog({
      ...stockDialog,
      open: false,
    });
  };

  const handleStockSubmit = async () => {
    try {
      const currentStock = stockDialog.item?.inventory_Info?.[0]?.quantity || 0;

      if (!stockDialog.data.quantity || stockDialog.data.quantity <= 0) {
        onError('Please enter a valid quantity greater than zero');
        return;
      }

      if (stockDialog.type === 'remove' && stockDialog.data.quantity > currentStock) {
        onError(`Cannot remove more than current stock (${currentStock} units)`);
        return;
      }

      const stockData = {
        productId: stockDialog.item._id,
        quantity: Number(stockDialog.data.quantity),
        notes: stockDialog.data.notes || ""
      };

      if (stockDialog.type === 'add') {
        await handlers.handleAddStock(stockData);
      } else {
        await handlers.handleRemoveStock(stockData);
      }

      closeStockDialog();
    } catch (error) {
      onError(error.message || `Failed to ${stockDialog.type} stock`);
    }
  };

  // Build table columns with action handlers
  const tableColumns = useMemo(() =>
    columnsState.map(col => ({
      ...col,
      renderCell: col.renderCell ?
        (row, rowIndex) => col.renderCell(row, rowIndex, {
          ...handlers,
          permissions,
          openStockDialog,
        }) : undefined
    })),
    [columnsState, handlers, permissions]
  );

  return (
    <div className='flex flex-col gap-5'>
      {/* Header and Stats */}
      <InventoryHead
        inventoryListData={initialCardCounts}
      />

      <Grid container spacing={3}>
        {/* New Product Button */}
        {permissions.canCreate && (
          <Grid size={12}>
            <div className="flex justify-end">
              <Button
                component={Link}
                href="/inventory/add"
                variant="contained"
                startIcon={<Icon icon="tabler:plus" />}
              >
                New Product
              </Button>
            </div>
          </Grid>
        )}

        {/* Filter Component */}
        <Grid size={12}>
          <InventoryFilter
            onFilterChange={handlers.handleFilterValueChange}
            filters={handlers.filterValues}
            onManageColumns={columnActions.open}
          />
        </Grid>

        {/* Inventory Table */}
        <Grid size={12}>
          <Card>
            <CustomListTable
              columns={tableColumns}
              rows={handlers.inventory}
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
              noDataText="No inventory items found."
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

      {/* Stock Management Dialog */}
      <Dialog open={stockDialog.open} onClose={closeStockDialog}>
        <DialogTitle>
          {stockDialog.type === 'add' ? 'Add Stock' : 'Remove Stock'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Product: {stockDialog.item?.name}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Current Quantity: {stockDialog.item?.inventory_Info?.[0]?.quantity || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stockDialog.type === 'add' ? 'New' : 'Remaining'} Quantity: {
                stockDialog.data.quantity
                  ? (stockDialog.type === 'add'
                    ? (stockDialog.item?.inventory_Info?.[0]?.quantity || 0) + Number(stockDialog.data.quantity)
                    : (stockDialog.item?.inventory_Info?.[0]?.quantity || 0) - Number(stockDialog.data.quantity))
                  : (stockDialog.item?.inventory_Info?.[0]?.quantity || 0)
              }
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Quantity"
              type="number"
              fullWidth
              inputProps={{ min: 1 }}
              error={stockDialog.data.quantity !== '' && parseInt(stockDialog.data.quantity, 10) <= 0}
              helperText={stockDialog.data.quantity !== '' && parseInt(stockDialog.data.quantity, 10) <= 0 ?
                "Quantity must be greater than zero" : ""}
              value={stockDialog.data.quantity}
              onChange={(e) => setStockDialog({
                ...stockDialog,
                data: { ...stockDialog.data, quantity: Number(e.target.value) }
              })}
            />
            <IconButton
              className='m-0'
              size="large"
              onClick={() => setStockDialog({
                ...stockDialog,
                data: { ...stockDialog.data, quantity: Number(stockDialog.data.quantity || 0) + 1 }
              })}
              title="Increment"
            >
              <AddIcon className='size-7 m-0 p-0' />
            </IconButton>
            <IconButton
              className='m-0'
              size="large"
              onClick={() => setStockDialog({
                ...stockDialog,
                data: { ...stockDialog.data, quantity: Math.max(0, Number(stockDialog.data.quantity || 0) - 1) }
              })}
              title="Decrement"
            >
              <RemoveIcon className='size-7 m-0 p-0' />
            </IconButton>
          </Box>
          <TextField
            margin="dense"
            label="Notes"
            multiline
            rows={3}
            fullWidth
            value={stockDialog.data.notes}
            onChange={(e) => setStockDialog({
              ...stockDialog,
              data: { ...stockDialog.data, notes: e.target.value }
            })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeStockDialog}>Cancel</Button>
          <Button
            onClick={handleStockSubmit}
            variant="contained"
            disabled={!stockDialog.data.quantity || parseInt(stockDialog.data.quantity, 10) <= 0}
          >
            {stockDialog.type === 'add' ? 'Add' : 'Remove'}
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
    </div>
  );
};

export default InventoryList;