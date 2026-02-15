'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Icon } from '@iconify/react';
import {
  Card,
  Button,
  Grid,
  Box,
  TextField,
  Typography,
  IconButton,
  Popover,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { usePermission } from '@/Auth/usePermission';

import InventoryHead from '@/views/inventory/inventoryList/inventoryHead';
import CustomListTable from '@/components/custom-components/CustomListTable';
import { useInventoryListHandlers } from '@/handlers/inventory/useInventoryListHandlers';
import { useBranchInventoryHandlers } from '@/handlers/inventory/useBranchInventoryHandlers';
import { getInventoryColumns } from './inventoryColumns';
import { getBranchInventoryColumns } from './branchInventoryColumns';
import { getBranchesForDropdown, getProvincesCities } from '@/app/(dashboard)/branches/actions';
import BranchStockTable from './BranchStockTable';
import BranchInventoryTable from './BranchInventoryTable';
import AppSnackbar from '@/components/shared/AppSnackbar';

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
  const [branches, setBranches] = useState([]);
  const [provincesCities, setProvincesCities] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [expandedBranchRows, setExpandedBranchRows] = useState({});
  const [activeTab, setActiveTab] = useState('inventory');

  // Simplified stock dialog state (for branch-level add/remove)
  const [stockDialog, setStockDialog] = useState({
    open: false,
    type: null, // 'add' or 'remove'
    branchRow: null, // The branch being modified
    anchorEl: null,
    quantity: '',
  });

  // Enhanced transfer dialog state
  const [transferDialog, setTransferDialog] = useState({
    open: false,
    branchRow: null,
    // Location filters for destination
    toProvince: '',
    toCity: '',
    toDistrict: '',
    toBranchId: '',
    quantity: '',
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

  const branchHandlers = useBranchInventoryHandlers({
    initialBranches: [],
    initialPagination: { current: 1, pageSize: 10, total: 0 },
    onError,
  });

  useEffect(() => {
    const loadMetadata = async () => {
      const [branchList, provincesList] = await Promise.all([
        getBranchesForDropdown(),
        getProvincesCities(),
      ]);
      setBranches(Array.isArray(branchList) ? branchList : []);
      setProvincesCities(Array.isArray(provincesList) ? provincesList : []);
    };
    loadMetadata();
  }, []);

  const toggleRow = (rowId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  const handleRowClick = (row) => {
    toggleRow(row._id);
  };

  const toggleBranchRow = (rowId) => {
    setExpandedBranchRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  const handleBranchRowClick = (row) => {
    toggleBranchRow(row._id);
  };

  // Simplified stock dialog handlers (branch-level only)
  const openStockDialog = (type, branchRow, anchorEl) => {
    setStockDialog({
      open: true,
      type,
      branchRow,
      anchorEl,
      quantity: '',
    });
  };

  const closeStockDialog = () => {
    setStockDialog({
      open: false,
      type: null,
      branchRow: null,
      anchorEl: null,
      quantity: '',
    });
  };

  const handleStockSubmit = async () => {
    try {
      const { branchRow, type, quantity: qtyStr } = stockDialog;
      const quantity = Number(qtyStr || 0);

      if (!quantity || quantity <= 0) {
        onError('Enter a valid quantity');
        return;
      }

      const currentBranchStock = Number(branchRow?.quantity || 0);

      if (type === 'remove' && quantity > currentBranchStock) {
        onError(`Cannot remove more than branch stock (${currentBranchStock} units)`);
        return;
      }

      const stockData = {
        productId: branchRow?.parentItem?._id,
        quantity,
        notes: '',
        branchEntries: [
          {
            branchId: branchRow.branchId,
            branchName: branchRow.branchName,
            branchType: branchRow.branchType,
            province: branchRow.province,
            city: branchRow.city,
            district: branchRow.district,
            quantity,
          },
        ],
      };

      if (type === 'add') {
        await handlers.handleAddStock(stockData);
      } else {
        await handlers.handleRemoveStock(stockData);
      }

      closeStockDialog();
      await branchHandlers.fetchData();
    } catch (error) {
      onError(error.message || `Failed to ${stockDialog.type} stock`);
    }
  };

  // Enhanced transfer dialog handlers
  const openTransferDialog = (branchRow) => {
    setTransferDialog({
      open: true,
      branchRow,
      toProvince: '',
      toCity: '',
      toDistrict: '',
      toBranchId: '',
      quantity: '',
    });
  };

  const closeTransferDialog = () => {
    setTransferDialog({
      open: false,
      branchRow: null,
      toProvince: '',
      toCity: '',
      toDistrict: '',
      toBranchId: '',
      quantity: '',
    });
  };

  const updateTransferDialog = (field, value) => {
    setTransferDialog((prev) => {
      const updated = { ...prev, [field]: value };
      // Reset dependent fields
      if (field === 'toProvince') {
        updated.toCity = '';
        updated.toDistrict = '';
        updated.toBranchId = '';
      } else if (field === 'toCity') {
        updated.toDistrict = '';
        updated.toBranchId = '';
      } else if (field === 'toDistrict') {
        updated.toBranchId = '';
      }
      return updated;
    });
  };

  // Get transfer dialog options
  const transferProvinceDoc = useMemo(() =>
    provincesCities.find((p) => p.province === transferDialog.toProvince),
    [provincesCities, transferDialog.toProvince]
  );
  const transferCityOptions = transferProvinceDoc?.cities || [];
  const transferCityDoc = useMemo(() =>
    transferCityOptions.find((c) => c.name === transferDialog.toCity),
    [transferCityOptions, transferDialog.toCity]
  );
  const transferDistrictOptions = transferCityDoc?.districts || [];
  const transferFilteredBranches = useMemo(() =>
    branches.filter((branch) => {
      // Exclude source branch
      if (branch.branchId === transferDialog.branchRow?.branchId) return false;
      // Filter by location selections
      if (transferDialog.toProvince && branch.province !== transferDialog.toProvince) return false;
      if (transferDialog.toCity && branch.city !== transferDialog.toCity) return false;
      if (transferDialog.toDistrict && branch.district !== transferDialog.toDistrict) return false;
      return true;
    }),
    [branches, transferDialog.branchRow?.branchId, transferDialog.toProvince, transferDialog.toCity, transferDialog.toDistrict]
  );

  // Get destination branch current stock for this item
  const getDestinationBranchStock = () => {
    if (!transferDialog.toBranchId || !transferDialog.branchRow?.parentItem) return 0;
    const inventoryBranches = transferDialog.branchRow.parentItem?.inventory_Info?.[0]?.branches || [];
    const destBranch = inventoryBranches.find((b) => b.branchId === transferDialog.toBranchId);
    return Number(destBranch?.quantity || 0);
  };

  const handleTransferSubmit = async () => {
    try {
      const fromBranch = transferDialog.branchRow;
      const toBranch = branches.find((branch) => branch.branchId === transferDialog.toBranchId);
      const quantity = Number(transferDialog.quantity || 0);

      if (!fromBranch || !toBranch) {
        onError('Select a destination branch');
        return;
      }

      if (fromBranch.branchId === toBranch.branchId) {
        onError('Select a different branch for transfer');
        return;
      }

      if (!quantity || quantity <= 0) {
        onError('Enter a valid transfer quantity');
        return;
      }

      const sourceStock = Number(fromBranch.quantity || 0);
      if (quantity > sourceStock) {
        onError(`Cannot transfer more than branch stock (${sourceStock} units)`);
        return;
      }

      const removePayload = {
        productId: fromBranch.parentItem?._id,
        quantity,
        notes: `Transfer to ${toBranch.name}`,
        branchEntries: [
          {
            branchId: fromBranch.branchId,
            branchName: fromBranch.branchName,
            branchType: fromBranch.branchType,
            province: fromBranch.province,
            city: fromBranch.city,
            district: fromBranch.district,
            quantity,
          },
        ],
      };

      const addPayload = {
        productId: fromBranch.parentItem?._id,
        quantity,
        notes: `Transfer from ${fromBranch.branchName}`,
        branchEntries: [
          {
            branchId: toBranch.branchId,
            branchName: toBranch.name,
            branchType: toBranch.branchType,
            province: toBranch.province,
            city: toBranch.city,
            district: toBranch.district,
            quantity,
          },
        ],
      };

      await handlers.handleRemoveStock(removePayload);
      await handlers.handleAddStock(addPayload);
      closeTransferDialog();
      await branchHandlers.fetchData();
    } catch (error) {
      onError(error.message || 'Failed to transfer stock');
    }
  };

  // Handler for inline branch entry save from BranchStockTable
  const handleSaveBranchEntry = async (entryData) => {
    try {
      const stockData = {
        productId: entryData.productId,
        quantity: entryData.quantity,
        notes: 'Initial stock allocation',
        branchEntries: [
          {
            branchId: entryData.branchId,
            branchName: entryData.branchName,
            branchType: entryData.branchType,
            province: entryData.province,
            city: entryData.city,
            district: entryData.district,
            quantity: entryData.quantity,
          },
        ],
      };
      await handlers.handleAddStock(stockData);
      await branchHandlers.fetchData();
    } catch (error) {
      onError(error.message || 'Failed to add branch stock');
    }
  };

  const handleSaveBranchInventoryEntry = async (entryData) => {
    try {
      const stockData = {
        productId: entryData.productId,
        quantity: entryData.quantity,
        notes: 'Initial stock allocation',
        branchEntries: [
          {
            branchId: entryData.branchId,
            branchName: entryData.branchName,
            branchType: entryData.branchType,
            province: entryData.province,
            city: entryData.city,
            district: entryData.district,
            quantity: entryData.quantity,
          },
        ],
      };
      await handlers.handleAddStock(stockData);
      await branchHandlers.fetchData();
    } catch (error) {
      onError(error.message || 'Failed to add branch inventory');
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
          expandedRows,
          toggleRow,
          openTransferDialog,
        }) : undefined
    })),
    [columns, handlers, permissions, expandedRows]
  );

  const branchColumns = useMemo(() => getBranchInventoryColumns(), []);

  const branchTableColumns = useMemo(() =>
    branchColumns.map(col => ({
      ...col,
      renderCell: col.renderCell ?
        (row, rowIndex) => col.renderCell(row, rowIndex, {
          permissions,
          expandedRows: expandedBranchRows,
          toggleRow: toggleBranchRow,
        }) : undefined
    })),
    [branchColumns, permissions, expandedBranchRows]
  );

  const filteredInventory = useMemo(() => (
    Array.isArray(handlers.inventory) ? handlers.inventory : []
  ), [handlers.inventory]);

  // Render function for expanded row content (branch sub-table)
  const renderExpandableRow = (row) => (
    <BranchStockTable
      inventoryItem={row}
      branches={branches}
      provincesCities={provincesCities}
      permissions={permissions}
      onAddStock={openStockDialog}
      onRemoveStock={openStockDialog}
      onTransfer={openTransferDialog}
      onSaveBranchEntry={handleSaveBranchEntry}
      stockLoading={handlers.stockLoading}
    />
  );

  const renderBranchExpandableRow = (branch) => (
    <BranchInventoryTable
      branch={branch}
      permissions={permissions}
      onAddStock={openStockDialog}
      onRemoveStock={openStockDialog}
      onTransfer={openTransferDialog}
      onSaveBranchEntry={handleSaveBranchInventoryEntry}
      stockLoading={handlers.stockLoading}
    />
  );

  // Stock dialog calculations
  const stockDialogQuantity = Number(stockDialog.quantity || 0);
  const currentBranchStock = Number(stockDialog.branchRow?.quantity || 0);
  const projectedBranchStock = stockDialog.type === 'add'
    ? currentBranchStock + stockDialogQuantity
    : Math.max(0, currentBranchStock - stockDialogQuantity);

  // Transfer dialog calculations
  const transferQuantity = Number(transferDialog.quantity || 0);
  const sourceStock = Number(transferDialog.branchRow?.quantity || 0);
  const destStock = getDestinationBranchStock();
  const projectedSourceStock = Math.max(0, sourceStock - transferQuantity);
  const projectedDestStock = destStock + transferQuantity;

  return (
    <div className='flex flex-col gap-5'>
      {/* Header and Stats */}
      <InventoryHead
        inventoryListData={initialCardCounts}
      />

      <Box sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Inventory" value="inventory" />
          <Tab label="Distribution" value="distribution" />
        </Tabs>
      </Box>

      {activeTab === 'inventory' && (
        <Grid container spacing={3}>
          {/* Inventory Table */}
          <Grid size={12}>
            <CustomListTable
              columns={tableColumns}
              rows={filteredInventory}
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
              onRowClick={handleRowClick}
              getRowClassName={() => 'cursor-pointer'}
              expandedRows={expandedRows}
              expandableRowRender={renderExpandableRow}
            />
          </Grid>
        </Grid>
      )}

      {activeTab === 'distribution' && (
        <Grid container spacing={3}>
          <Grid size={12}>
            <CustomListTable
              columns={branchTableColumns}
              rows={branchHandlers.branches}
              loading={branchHandlers.loading}
              showSearch={true}
              searchValue={branchHandlers.searchTerm || ''}
              onSearchChange={branchHandlers.handleSearchInputChange}
              searchPlaceholder="Search distribution..."
              pagination={{
                page: branchHandlers.pagination.current - 1,
                pageSize: branchHandlers.pagination.pageSize,
                total: branchHandlers.pagination.total,
              }}
              onPageChange={(newPage) => branchHandlers.handlePageChange(null, newPage)}
              onRowsPerPageChange={branchHandlers.handlePageSizeChange}
              onSort={branchHandlers.handleSortRequest}
              sortBy={branchHandlers.sortBy}
              sortDirection={branchHandlers.sortDirection}
              noDataText="No distribution locations found."
              rowKey={(row) => row._id || row.id}
              onRowClick={handleBranchRowClick}
              getRowClassName={() => 'cursor-pointer'}
              expandedRows={expandedBranchRows}
              expandableRowRender={renderBranchExpandableRow}
            />
          </Grid>
        </Grid>
      )}

      {/* Simplified Stock Management Popover (Branch-level) */}
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
            maxWidth: '95vw',
            borderRadius: 2,
            boxShadow: theme.shadows[8],
            border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          }
        }}
      >
        <Box className="px-3 py-2.5">
          {/* Header */}
          <Box className="flex items-center justify-between mb-2">
            <Box className="flex items-center gap-1.5">
              <Icon
                icon={stockDialog.type === 'add' ? 'mdi:plus-circle' : 'mdi:minus-circle'}
                width={18}
                color={stockDialog.type === 'add' ? theme.palette.success.main : theme.palette.error.main}
              />
              <Typography variant="subtitle2" fontWeight={600}>
                {stockDialog.type === 'add' ? 'Add Stock' : 'Remove Stock'}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={closeStockDialog}
              sx={{ p: 0.25 }}
            >
              <Icon icon="mdi:close" width={16} />
            </IconButton>
          </Box>

          {/* Branch Info */}
          <Box className="mb-2 p-2 rounded" sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
            <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
              Branch
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {stockDialog.branchRow?.branchName}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
              {stockDialog.branchRow?.province}, {stockDialog.branchRow?.city}
              {stockDialog.branchRow?.district ? `, ${stockDialog.branchRow.district}` : ''}
            </Typography>
          </Box>

          {/* Stock Preview */}
          <Box className="flex items-center justify-center gap-2 mb-3">
            <Box className="text-center">
              <Typography variant="caption" color="text.secondary" fontSize="0.65rem">Current</Typography>
              <Typography variant="h6" fontWeight={600}>{currentBranchStock}</Typography>
            </Box>
            <Icon
              icon={stockDialog.type === 'add' ? 'mdi:arrow-right-thick' : 'mdi:arrow-right-thick'}
              width={20}
              color={stockDialog.type === 'add' ? theme.palette.success.main : theme.palette.error.main}
            />
            <Box className="text-center">
              <Typography variant="caption" color="text.secondary" fontSize="0.65rem">After</Typography>
              <Typography
                variant="h6"
                fontWeight={600}
                color={stockDialog.type === 'add' ? 'success.main' : 'error.main'}
              >
                {stockDialogQuantity > 0 ? projectedBranchStock : '-'}
              </Typography>
            </Box>
          </Box>

          {/* Quantity Input */}
          <TextField
            size="small"
            fullWidth
            label="Quantity"
            type="number"
            value={stockDialog.quantity}
            onChange={(e) => {
              const value = e.target.value;
              // For remove operation, limit to current branch stock
              if (stockDialog.type === 'remove') {
                const numValue = Number(value);
                if (numValue > currentBranchStock) {
                  setStockDialog((prev) => ({ ...prev, quantity: String(currentBranchStock) }));
                  return;
                }
              }
              setStockDialog((prev) => ({ ...prev, quantity: value }));
            }}
            inputProps={{
              min: 1,
              ...(stockDialog.type === 'remove' && { max: currentBranchStock }),
            }}
            helperText={stockDialog.type === 'remove' ? `Max: ${currentBranchStock} units` : ''}
            sx={{ mb: 2 }}
          />

          {/* Actions */}
          <Box className="flex gap-1.5">
            <Button
              size="small"
              variant="outlined"
              onClick={closeStockDialog}
              sx={{ flex: 1, fontSize: '0.75rem' }}
            >
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              color={stockDialog.type === 'add' ? 'success' : 'error'}
              onClick={handleStockSubmit}
              disabled={
                stockDialogQuantity <= 0 ||
                handlers.stockLoading?.addStock ||
                handlers.stockLoading?.removeStock
              }
              sx={{ flex: 1, fontSize: '0.75rem' }}
            >
              {handlers.stockLoading?.[stockDialog.type === 'add' ? 'addStock' : 'removeStock']
                ? 'Processing...'
                : (stockDialog.type === 'add' ? 'Add' : 'Remove')
              }
            </Button>
          </Box>
        </Box>
      </Popover>

      {/* Enhanced Transfer Stock Dialog */}
      <Dialog
        open={transferDialog.open}
        onClose={closeTransferDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box className="flex items-center gap-1.5">
            <Icon icon="mdi:swap-horizontal" width={22} color={theme.palette.info.main} />
            <Typography variant="h6">Transfer Stock</Typography>
          </Box>
        </DialogTitle>
        <DialogContent className="flex flex-col gap-4">
          {/* Source -> Transfer Icon -> Destination Layout */}
          <Box
            className="flex items-stretch gap-3"
            sx={{
              mt: 1,
              p: 2,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.background.default, 0.5),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            {/* Source Branch (Left) */}
            <Box
              className="flex-1 p-3 rounded-lg"
              sx={{
                backgroundColor: alpha(theme.palette.error.main, 0.04),
                border: `1px solid ${alpha(theme.palette.error.main, 0.15)}`,
              }}
            >
              <Box className="flex items-center gap-1 mb-2">
                <Icon icon="mdi:store-marker" width={16} color={theme.palette.error.main} />
                <Typography variant="caption" color="error.main" fontWeight={600} textTransform="uppercase">
                  From
                </Typography>
              </Box>
              <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                {transferDialog.branchRow?.branchName}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {transferDialog.branchRow?.province}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {transferDialog.branchRow?.city}
                {transferDialog.branchRow?.district ? `, ${transferDialog.branchRow.district}` : ''}
              </Typography>
              <Box
                className="mt-2 pt-2 flex items-center gap-1"
                sx={{ borderTop: `1px dashed ${alpha(theme.palette.error.main, 0.2)}` }}
              >
                <Icon icon="mdi:package-variant" width={14} color={theme.palette.text.secondary} />
                <Typography variant="caption" color="text.secondary">
                  Stock:
                </Typography>
                <Typography variant="body2" fontWeight={600} color="error.main">
                  {sourceStock} units
                </Typography>
              </Box>
            </Box>

            {/* Transfer Icon (Center) */}
            <Box className="flex flex-col items-center justify-center px-2">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: alpha(theme.palette.info.main, 0.1),
                  border: `2px solid ${alpha(theme.palette.info.main, 0.3)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon icon="mdi:arrow-right-bold" width={24} color={theme.palette.info.main} />
              </Box>
              {transferQuantity > 0 && (
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="info.main"
                  sx={{ mt: 1 }}
                >
                  {transferQuantity} units
                </Typography>
              )}
            </Box>

            {/* Destination Branch (Right) */}
            <Box
              className="flex-1 p-3 rounded-lg"
              sx={{
                backgroundColor: alpha(theme.palette.success.main, 0.04),
                border: `1px solid ${alpha(theme.palette.success.main, 0.15)}`,
              }}
            >
              <Box className="flex items-center gap-1 mb-2">
                <Icon icon="mdi:store-check" width={16} color={theme.palette.success.main} />
                <Typography variant="caption" color="success.main" fontWeight={600} textTransform="uppercase">
                  To
                </Typography>
              </Box>
              {transferDialog.toBranchId ? (
                <>
                  <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                    {branches.find((b) => b.branchId === transferDialog.toBranchId)?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {branches.find((b) => b.branchId === transferDialog.toBranchId)?.province}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {branches.find((b) => b.branchId === transferDialog.toBranchId)?.city}
                    {branches.find((b) => b.branchId === transferDialog.toBranchId)?.district
                      ? `, ${branches.find((b) => b.branchId === transferDialog.toBranchId)?.district}`
                      : ''}
                  </Typography>
                  <Box
                    className="mt-2 pt-2 flex items-center gap-1"
                    sx={{ borderTop: `1px dashed ${alpha(theme.palette.success.main, 0.2)}` }}
                  >
                    <Icon icon="mdi:package-variant" width={14} color={theme.palette.text.secondary} />
                    <Typography variant="caption" color="text.secondary">
                      Stock:
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="success.main">
                      {destStock} → {projectedDestStock} units
                    </Typography>
                  </Box>
                </>
              ) : (
                <Box className="flex flex-col items-center justify-center py-3">
                  <Icon icon="mdi:store-search" width={24} color={theme.palette.text.disabled} />
                  <Typography variant="caption" color="text.disabled" sx={{ mt: 1 }}>
                    Select destination
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Destination Selection Section */}
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 1.5, display: 'block' }}>
              Filter Destination by Location
            </Typography>
            <Box className="flex gap-2 mb-2">
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel sx={{ fontSize: '0.75rem' }}>Province</InputLabel>
                <Select
                  label="Province"
                  value={transferDialog.toProvince}
                  onChange={(e) => updateTransferDialog('toProvince', e.target.value)}
                  sx={{ fontSize: '0.8rem' }}
                >
                  <MenuItem value=""><em>All</em></MenuItem>
                  {provincesCities.map((p) => (
                    <MenuItem key={p.province} value={p.province}>
                      {p.province}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ flex: 1 }} disabled={!transferDialog.toProvince}>
                <InputLabel sx={{ fontSize: '0.75rem' }}>City</InputLabel>
                <Select
                  label="City"
                  value={transferDialog.toCity}
                  onChange={(e) => updateTransferDialog('toCity', e.target.value)}
                  sx={{ fontSize: '0.8rem' }}
                >
                  <MenuItem value=""><em>All</em></MenuItem>
                  {transferCityOptions.map((c) => (
                    <MenuItem key={c.name} value={c.name}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ flex: 1 }} disabled={!transferDialog.toCity}>
                <InputLabel sx={{ fontSize: '0.75rem' }}>District</InputLabel>
                <Select
                  label="District"
                  value={transferDialog.toDistrict}
                  onChange={(e) => updateTransferDialog('toDistrict', e.target.value)}
                  sx={{ fontSize: '0.8rem' }}
                >
                  <MenuItem value=""><em>All</em></MenuItem>
                  {transferDistrictOptions.map((d) => (
                    <MenuItem key={d} value={d}>
                      {d}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Destination Branch Selection */}
            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
              <InputLabel>Destination Branch *</InputLabel>
              <Select
                label="Destination Branch *"
                value={transferDialog.toBranchId}
                onChange={(e) => setTransferDialog((prev) => ({ ...prev, toBranchId: e.target.value }))}
              >
                {transferFilteredBranches.length === 0 ? (
                  <MenuItem value="" disabled>No branches available</MenuItem>
                ) : (
                  transferFilteredBranches.map((branch) => (
                    <MenuItem key={branch.branchId} value={branch.branchId}>
                      {branch.name} ({branch.branchType})
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {/* Transfer Quantity */}
            <TextField
              size="small"
              label="Transfer Quantity *"
              type="number"
              fullWidth
              value={transferDialog.quantity}
              onChange={(e) => {
                const value = e.target.value;
                const numValue = Number(value);
                // Limit to source stock
                if (numValue > sourceStock) {
                  setTransferDialog((prev) => ({ ...prev, quantity: String(sourceStock) }));
                  return;
                }
                setTransferDialog((prev) => ({ ...prev, quantity: value }));
              }}
              inputProps={{ min: 1, max: sourceStock }}
              helperText={`Max: ${sourceStock} units available`}
            />
          </Box>

          {/* Stock Preview */}
          {transferDialog.toBranchId && transferQuantity > 0 && (
            <Box
              className="flex gap-4 p-3 rounded-lg"
              sx={{
                backgroundColor: alpha(theme.palette.info.main, 0.04),
                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
              }}
            >
              {/* Source Stock Change */}
              <Box className="flex-1 text-center">
                <Typography variant="caption" color="text.secondary" fontSize="0.65rem" textTransform="uppercase">
                  Source After Transfer
                </Typography>
                <Box className="flex items-center justify-center gap-1.5 mt-0.5">
                  <Typography variant="body1" fontWeight={500} color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                    {sourceStock}
                  </Typography>
                  <Icon icon="mdi:arrow-right" width={16} color={theme.palette.error.main} />
                  <Typography variant="h6" fontWeight={700} color="error.main">
                    {projectedSourceStock}
                  </Typography>
                </Box>
              </Box>
              {/* Destination Stock Change */}
              <Box className="flex-1 text-center">
                <Typography variant="caption" color="text.secondary" fontSize="0.65rem" textTransform="uppercase">
                  Destination After Transfer
                </Typography>
                <Box className="flex items-center justify-center gap-1.5 mt-0.5">
                  <Typography variant="body1" fontWeight={500} color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                    {destStock}
                  </Typography>
                  <Icon icon="mdi:arrow-right" width={16} color={theme.palette.success.main} />
                  <Typography variant="h6" fontWeight={700} color="success.main">
                    {projectedDestStock}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={closeTransferDialog} color="secondary" size="small">
            Cancel
          </Button>
          <Button
            onClick={handleTransferSubmit}
            variant="contained"
            color="info"
            size="small"
            startIcon={<Icon icon="mdi:swap-horizontal" width={18} />}
            disabled={
              !transferDialog.toBranchId ||
              transferQuantity <= 0 ||
              transferQuantity > sourceStock ||
              handlers.stockLoading?.addStock ||
              handlers.stockLoading?.removeStock
            }
          >
            {handlers.stockLoading?.addStock || handlers.stockLoading?.removeStock
              ? 'Processing...'
              : 'Transfer Stock'
            }
          </Button>
        </DialogActions>
      </Dialog>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleSnackbarClose}
        autoHideDuration={6000}
      />
    </div>
  );
};

export default InventoryList;
