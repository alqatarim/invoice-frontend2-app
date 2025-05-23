'use client';

import React, { useState, useEffect, useMemo } from 'react';

import {
    ToggleButtonGroup,
  ButtonGroup,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Card,
  TableSortLabel,
  TablePagination,
  Button,
  Grid,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  ViewColumn as ViewColumnIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import { usePermission } from '@/Auth/usePermission';
import { addStock, removeStock } from '@/app/(dashboard)/inventory/actions';
import InventoryHead from '@/views/inventory/inventoryList/inventoryHead';
import InventoryFilter from '@/views/inventory/inventoryList/inventoryFilter';
import { amountFormat } from '@/utils/currencyUtils';

const InventoryList = ({
  inventory,
  pagination,
  filters,
  isLoading,
  sortBy,
  sortDirection,
  onPaginationChange,
  onFiltersChange,
  onSortChange,
  fetchData,
}) => {
  const { data: session } = useSession();
  const canCreate = usePermission('inventory', 'create');
  const canUpdate = usePermission('inventory', 'update');
  const canView = usePermission('inventory', 'view');

  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [columns, setColumns] = useState([
    { key: 'index', label: '#', visible: true },
    { key: 'name', label: 'Item', visible: true },
    { key: 'sku', label: 'Code', visible: true },
    { key: 'units', label: 'Units', visible: true },
    { key: 'quantity', label: 'Quantity', visible: true },
    { key: 'sellingPrice', label: 'Sales Price', visible: true },
    { key: 'purchasePrice', label: 'Purchase Price', visible: true },
    { key: 'action', label: 'Action', visible: true },
  ]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [stockDialog, setStockDialog] = useState({
    open: false,
    type: null, // 'add' or 'remove'
    data: {
      quantity: '',
      notes: '',
    },
  });

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleStockDialogOpen = (type) => {
    setStockDialog({
      open: true,
      type,
      data: {
        quantity: '',
        notes: '',
        productId: selectedItem?._id,
        item: selectedItem
      },
    });
  };

  const handleStockDialogClose = () => {
    setStockDialog({
      ...stockDialog,
      open: false,
    });
  };

  const handleStockSubmit = async () => {
    try {
    //   const item = stockDialog.data.item;
    //   console.log('Selected Item in handleStockSubmit:', item);
    //   console.log('Inventory Info:', item?.inventory_Info);

      const currentStock = selectedItem?.inventory_Info[0]?.quantity



      if (!stockDialog.data.quantity || stockDialog.data.quantity <= 0) {
        setSnackbar({
          open: true,
          message: 'Please enter a valid quantity greater than zero',
          severity: 'error',
        });
        return;
      }

      if (stockDialog.type === 'remove' && stockDialog.data.quantity > currentStock) {
        setSnackbar({
          open: true,
          message: `Cannot remove more than current stock (${currentStock} units)`,
          severity: 'error',
        });
        return;
      }

      if (!selectedItem?._id) {
        setSnackbar({
          open: true,
          message: 'Invalid product selected',
          severity: 'error',
        });
        return;
      }

      const stockData = {
        productId: selectedItem._id,
        quantity: Number(stockDialog.data.quantity),
        notes: stockDialog.data.notes || ""
      };

      const response = stockDialog.type === 'add'
        ? await addStock(stockData)
        : await removeStock(stockData);

      if (response) {
        setSnackbar({
          open: true,
          message: `Stock ${stockDialog.type === 'add' ? 'added' : 'removed'} successfully`,
          severity: 'success',
        });
        fetchData(pagination.current, pagination.pageSize, filters);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || `Failed to ${stockDialog.type} stock`,
        severity: 'error',
      });
    } finally {
      handleStockDialogClose();
    }
  };

  const handlePageChange = (event, newPage) => {
    onPaginationChange({
      ...pagination,
      current: newPage + 1,
    });
  };

  const handlePageSizeChange = (event) => {
    onPaginationChange({
      ...pagination,
      pageSize: parseInt(event.target.value, 10),
      current: 1,
    });
  };

  const handleSortRequest = (columnKey) => {
    const newDirection = sortBy === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(columnKey, newDirection);
  };

  const handleReset = () => {
    onFiltersChange({});
    onSortChange('', 'asc');
  };

  const isFilterApplied = useMemo(() => {
    return Object.keys(filters).length > 0;
  }, [filters]);

  // Skeleton components for loading state
  const TableRowSkeleton = () => (
    <TableRow>
      {columns.filter(col => col.visible).map((column) => (
        <TableCell key={column.key}>
          <Box sx={{ height: 24, bgcolor: 'grey.100', borderRadius: 1 }} />
        </TableCell>
      ))}
    </TableRow>
  );

  return (
    <div>
      {/* Stats Cards */}
      <InventoryHead stats={inventory} isLoading={isLoading} />

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, mt: 6 }}>
        <Button
          variant="outlined"
          startIcon={<ClearIcon />}
          onClick={handleReset}
          sx={{ mr: 1 }}
        >
          Reset
        </Button>
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={() => setFilterOpen(true)}
        >
          Filter {isFilterApplied && '*'}
        </Button>
      </Box>

      {/* Inventory Table */}
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              {columns.filter(col => col.visible).map((column) => (
                <TableCell key={column.key}>
                  {column.key !== 'action' ? (
                    <TableSortLabel
                      active={sortBy === column.key}
                      direction={sortBy === column.key ? sortDirection : 'asc'}
                      onClick={() => handleSortRequest(column.key)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from(new Array(5)).map((_, index) => (
                <TableRowSkeleton key={index} />
              ))
            ) : inventory.length > 0 ? (
              inventory.map((item, index) => (
                <TableRow key={item._id}>
                  <TableCell>{(pagination.current - 1) * pagination.pageSize + index + 1}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.unitInfo?.[0]?.name}</TableCell>
                  <TableCell>{item.inventory_Info?.[0]?.quantity || 0}</TableCell>
                  <TableCell>${amountFormat(item.sellingPrice)}</TableCell>
                  <TableCell>${amountFormat(item.purchasePrice)}</TableCell>
                  <TableCell
                   className='m-0 p-0'
                  >
                    {canUpdate && (



                      <ButtonGroup
                        variant='outlined'
                        color= 'secondary'
                      >
                        <Button



                          onClick={() => {
                            setSelectedItem(item);
                            handleStockDialogOpen('add');
                          }}
                        >
                          <AddIcon color='success' />
                        </Button>
                        <Button



                          onClick={() => {
                            setSelectedItem(item);
                            handleStockDialogOpen('remove');
                          }}
                          title="Remove Stock"
                        >
                          <RemoveIcon color='error' className='size-5' />
                        </Button>
                      </ButtonGroup>

                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  No inventory items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.current - 1}
          onPageChange={handlePageChange}
          rowsPerPage={pagination.pageSize}
          onRowsPerPageChange={handlePageSizeChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>

      {/* Filter Drawer */}
      <InventoryFilter
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onFilterChange={onFiltersChange}
        filters={filters}
      />

      {/* Stock Dialog */}
      <Dialog open={stockDialog.open} onClose={handleStockDialogClose}>
        <DialogTitle>
          {stockDialog.type === 'add' ? 'Add Stock' : 'Remove Stock'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Product: {selectedItem?.name}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Current Quantity: {selectedItem?.inventory_Info[0]?.quantity || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stockDialog.type === 'add' ? 'New' : 'Remaining'} Quantity: {
                stockDialog.data.quantity
                  ? (stockDialog.type === 'add'
                    ? (selectedItem?.inventory_Info[0]?.quantity || 0) + Number(stockDialog.data.quantity)
                    : (selectedItem?.inventory_Info[0]?.quantity || 0) - Number(stockDialog.data.quantity))
                  : (selectedItem?.inventory_Info[0]?.quantity || 0)
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
              <AddIcon className='size-7 m-0 p-0'  />
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
              <RemoveIcon className='size-7 m-0 p-0'  />
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
          <Button onClick={handleStockDialogClose}>Cancel</Button>
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
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default InventoryList;