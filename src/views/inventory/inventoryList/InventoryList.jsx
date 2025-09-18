'use client';

import React, { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';
import {
  Card,
  Button,
  Snackbar,
  Alert,
  Grid,
  Box,
  TextField,
  Typography,
  IconButton,
  Popover,
  Paper,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { usePermission } from '@/Auth/usePermission';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';

import InventoryHead from '@/views/inventory/inventoryList/inventoryHead';
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
    anchorEl: null,
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


  // Stock dialog handlers
  const openStockDialog = (type, item, anchorEl) => {
    setStockDialog({
      open: true,
      type,
      item,
      anchorEl,
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
      anchorEl: null,
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
    columns.map(col => ({
      ...col,
      renderCell: col.renderCell ?
        (row, rowIndex) => col.renderCell(row, rowIndex, {
          ...handlers,
          permissions,
          openStockDialog,
          stockLoading: handlers.stockLoading,
        }) : undefined
    })),
    [columns, handlers, permissions]
  );

  return (
    <div className='flex flex-col gap-5'>
      {/* Header and Stats */}
      <InventoryHead
        inventoryListData={initialCardCounts}
      />

      <Grid container spacing={3}>
        {/* Inventory Table */}
        <Grid size={12}>
          <CustomListTable
            columns={tableColumns}
            rows={handlers.inventory}
            loading={handlers.loading}
            showSearch={true}
            searchValue={handlers.searchTerm || ''}
            onSearchChange={handlers.handleSearchInputChange}
            searchPlaceholder="Search inventory..."
            pagination={{
              page: handlers.pagination.current - 1,
              pageSize: handlers.pagination.pageSize,
              total: handlers.pagination.total,
            }}
            onPageChange={(newPage) => handlers.handlePageChange(null, newPage)}
            onRowsPerPageChange={handlers.handlePageSizeChange}
            onSort={handlers.handleSortRequest}
            sortBy={handlers.sortBy}
            sortDirection={handlers.sortDirection}
            noDataText="No inventory items found."
            rowKey={(row) => row._id || row.id}
          />
        </Grid>
      </Grid>


      {/* Stock Management Popover */}
      <Popover
        open={stockDialog.open}
        anchorEl={stockDialog.anchorEl}
        onClose={closeStockDialog}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            width: 280,
            maxWidth: '90vw',
            borderRadius: 3,
            boxShadow: theme.shadows[12],
            border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          }
        }}
      >
        <Box className="px-4 py-3">
          {/* Compact Header with Product Info */}
          <Box className="flex items-center justify-between mb-3">
            <Box className="flex flex-col min-w-0 gap-2">
            <Box className="flex flex-row items-center gap-1 min-w-0">
              <Typography variant="body1" className=" truncate">
                {stockDialog.type === 'add' ? 'Add' : 'Remove'}
              </Typography>
              <Typography variant="body1" color='primary.main' className="font-semibold">
              {Number(stockDialog.data.quantity)}
              </Typography>
              <Typography variant="body1" className=" truncate">
                {stockDialog.item?.name}
              </Typography>

              </Box>

              <Box className="flex flex-row gap-1 items-center min-w-0">
              <Typography variant="h6" color="text.primary" className="font-semibold">
                {stockDialog.item?.inventory_Info?.[0]?.quantity || 0}
              </Typography>
          
              <Icon 
                icon={stockDialog.type === 'add' ? "mdi:arrow-up-right-thick" : 'mdi:arrow-down-right-thick'} 
                width={23} 
                color={stockDialog.type === 'add' ? theme.palette.success.dark : theme.palette.error.dark} 
              />


                  {/* Real-time Result */}
            {stockDialog.data.quantity && (
               <Typography variant="h6" color="text.primary" className="font-semibold">
                {
                  stockDialog.type === 'add'
                    ? (stockDialog.item?.inventory_Info?.[0]?.quantity || 0) + Number(stockDialog.data.quantity)
                    : Math.max(0, (stockDialog.item?.inventory_Info?.[0]?.quantity || 0) - Number(stockDialog.data.quantity))
                }
              </Typography>
            )}





              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={closeStockDialog}
              className="p-1 ml-2 opacity-70 hover:opacity-100"
              disabled={handlers.stockLoading?.addStock || handlers.stockLoading?.removeStock}
            >
              <Icon icon="tabler:x" className="text-lg" />
            </IconButton>
          </Box>

          {/* Horizontal Quantity Controls */}
          <Box className="flex items-center gap-3 mb-3">
            <Typography variant="body2" className="text-sm font-medium whitespace-nowrap">
              Quantity
            </Typography>
            
            <Box className="flex items-center gap-1 flex-1">
              <IconButton
                size="small"
                onClick={() => setStockDialog({
                  ...stockDialog,
                  data: { ...stockDialog.data, quantity: Math.max(1, Number(stockDialog.data.quantity || 0) - 1) }
                })}
                className="p-1.5 border border-gray-300 hover:border-gray-400 rounded-lg"
                disabled={Number(stockDialog.data.quantity || 0) <= 1 || handlers.stockLoading?.addStock || handlers.stockLoading?.removeStock}
              >
                <RemoveIcon className="text-base" />
              </IconButton>
              
              <TextField
                size="small"
                type="number"
                inputProps={{ 
                  min: 1, 
                  style: { textAlign: 'center', fontSize: '0.875rem' },
                  className: 'py-2'
                }}
                className="w-20"
                value={stockDialog.data.quantity}
                onChange={(e) => setStockDialog({
                  ...stockDialog,
                  data: { ...stockDialog.data, quantity: Math.max(1, Number(e.target.value) || 1) }
                })}
                disabled={handlers.stockLoading?.addStock || handlers.stockLoading?.removeStock}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  }
                }}
              />
              
              <IconButton
                size="small"
                onClick={() => setStockDialog({
                  ...stockDialog,
                  data: { ...stockDialog.data, quantity: Number(stockDialog.data.quantity || 0) + 1 }
                })}
                className="p-1.5 border border-gray-300 hover:border-gray-400 rounded-lg"
                disabled={handlers.stockLoading?.addStock || handlers.stockLoading?.removeStock}
              >
                <AddIcon className="text-base" />
              </IconButton>
            </Box>

        
          </Box>

          {/* Compact Actions */}
          <Box className="flex gap-2">
            <Button 
              size="small" 
              onClick={closeStockDialog}
              className="flex-1 py-1.5 text-sm"
              variant="outlined"
              color="secondary"
              disabled={handlers.stockLoading?.addStock || handlers.stockLoading?.removeStock}
            >
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleStockSubmit}
              disabled={
                !stockDialog.data.quantity || 
                parseInt(stockDialog.data.quantity, 10) <= 0 ||
                handlers.stockLoading?.addStock || 
                handlers.stockLoading?.removeStock
              }
              className="flex-1 py-1.5 text-sm font-medium"
              color="primary"
            >
              {handlers.stockLoading?.[stockDialog.type === 'add' ? 'addStock' : 'removeStock'] 
                ? 'Processing...' 
                : (stockDialog.type === 'add' ? 'Add' : 'Remove')
              }
            </Button>
          </Box>
        </Box>
      </Popover>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} className="w-full">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default InventoryList;