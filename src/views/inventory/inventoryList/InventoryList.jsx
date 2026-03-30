'use client';

import React, { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';
import {
  Alert,
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
import { getInventoryMovementHistory } from '@/app/(dashboard)/inventory/actions';

import InventoryHead from '@/views/inventory/inventoryList/inventoryHead';
import CustomListTable from '@/components/custom-components/CustomListTable';
import { useInventoryListHandlers } from '@/handlers/inventory/useInventoryListHandlers';
import { useBranchInventoryHandlers } from '@/handlers/inventory/useBranchInventoryHandlers';
import { getInventoryColumns } from './inventoryColumns';
import { getBranchInventoryColumns } from './branchInventoryColumns';
import BranchStockTable from './BranchStockTable';
import BranchInventoryTable from './BranchInventoryTable';
import InventoryMovementDialog from './InventoryMovementDialog';
import AppSnackbar from '@/components/shared/AppSnackbar';
import useAccessibleBranchScope from '@/hooks/useAccessibleBranchScope';

/**
 * InventoryList Component
 */
const getBranchIdentifiers = (branch = {}) => (
  [branch?.branchId, branch?._id]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
);

const branchMatchesIdentifier = (branch = {}, value = '') => {
  const normalizedValue = String(value || '').trim();
  if (!normalizedValue) return false;
  return getBranchIdentifiers(branch).includes(normalizedValue);
};

const findBranchByIdentifier = (branchList = [], value = '') =>
  (Array.isArray(branchList) ? branchList : []).find((branch) =>
    branchMatchesIdentifier(branch, value)
  ) || null;

const findInventoryBranchRecord = (inventoryBranches = [], branch = {}) => {
  const identifiers = new Set(getBranchIdentifiers(branch));

  return (Array.isArray(inventoryBranches) ? inventoryBranches : []).find((entry) =>
    identifiers.has(String(entry?.branchId || '').trim())
  ) || null;
};

const buildLocationTreeFromBranches = (branchList = []) => {
  const provinceMap = new Map();

  (Array.isArray(branchList) ? branchList : []).forEach((branch) => {
    const province = String(branch?.province || '').trim();
    const city = String(branch?.city || '').trim();
    const district = String(branch?.district || '').trim();

    if (!province || !city) {
      return;
    }

    if (!provinceMap.has(province)) {
      provinceMap.set(province, { province, cities: new Map() });
    }

    const provinceEntry = provinceMap.get(province);
    if (!provinceEntry.cities.has(city)) {
      provinceEntry.cities.set(city, { name: city, districts: new Set() });
    }

    if (district) {
      provinceEntry.cities.get(city).districts.add(district);
    }
  });

  return [...provinceMap.values()]
    .sort((left, right) => left.province.localeCompare(right.province))
    .map((provinceEntry) => ({
      province: provinceEntry.province,
      cities: [...provinceEntry.cities.values()]
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((cityEntry) => ({
          name: cityEntry.name,
          districts: [...cityEntry.districts].sort((left, right) => left.localeCompare(right)),
        })),
    }));
};

const InventoryList = ({
  initialInventory = [],
  pagination: initialPagination = { current: 1, pageSize: 10, total: 0 },
  cardCounts: initialCardCounts = {},
  initialBranchInventory = [],
  initialBranchPagination = { current: 1, pageSize: 10, total: 0 },
  initialBranches = [],
  initialProvincesCities = [],
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
  const branches = useMemo(
    () => (Array.isArray(initialBranches) ? initialBranches : []),
    [initialBranches]
  );
  const provincesCities = useMemo(
    () => (Array.isArray(initialProvincesCities) ? initialProvincesCities : []),
    [initialProvincesCities]
  );
  const branchScope = useAccessibleBranchScope({ branchesData: branches });
  const branchOptions = useMemo(
    () => (branchScope.branchOptions.length ? branchScope.branchOptions : branches),
    [branchScope.branchOptions, branches]
  );
  const scopedProvincesCities = useMemo(() => {
    const derivedLocations = buildLocationTreeFromBranches(branchOptions);
    return derivedLocations.length ? derivedLocations : provincesCities;
  }, [branchOptions, provincesCities]);
  const scopeHelperText = useMemo(() => {
    if (branchScope.isRestrictedToAssignedBranches) {
      if (branchScope.primaryBranch?.name) {
        return `Only your assigned branches are visible here. Primary branch: ${branchScope.primaryBranch.name}. Transfers and branch selectors stay inside this scope.`;
      }

      return 'Only your assigned branches are visible here. Transfers and branch selectors stay inside this scope.';
    }

    return 'Inventory actions respect your current company access. Branch selectors only show locations available to your role.';
  }, [branchScope.isRestrictedToAssignedBranches, branchScope.primaryBranch?.name]);
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
    notes: '',
  });

  const [cycleCountDialog, setCycleCountDialog] = useState({
    open: false,
    branchRow: null,
    countedQuantity: '',
    notes: '',
  });

  const [movementDialog, setMovementDialog] = useState({
    open: false,
    loading: false,
    rows: [],
    productName: '',
    branchLabel: '',
  });

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Notification handlers
  const onError = msg => setSnackbar({ open: true, message: msg, severity: 'error' });
  const onSuccess = msg => setSnackbar({ open: true, message: msg, severity: 'success' });

  // Initialize handlers with column definitions
  const columns = useMemo(() => getInventoryColumns({ permissions, theme }), [permissions, theme]);

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
    initialBranches: initialBranchInventory,
    initialPagination: initialBranchPagination,
    onError,
  });

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
      notes: '',
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
      notes: '',
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
    scopedProvincesCities.find((p) => p.province === transferDialog.toProvince),
    [scopedProvincesCities, transferDialog.toProvince]
  );
  const transferCityOptions = transferProvinceDoc?.cities || [];
  const transferCityDoc = useMemo(() =>
    transferCityOptions.find((c) => c.name === transferDialog.toCity),
    [transferCityOptions, transferDialog.toCity]
  );
  const transferDistrictOptions = transferCityDoc?.districts || [];
  const transferFilteredBranches = useMemo(() =>
    branchOptions.filter((branch) => {
      // Exclude source branch
      if (branchMatchesIdentifier(branch, transferDialog.branchRow?.branchId)) return false;
      // Filter by location selections
      if (transferDialog.toProvince && branch.province !== transferDialog.toProvince) return false;
      if (transferDialog.toCity && branch.city !== transferDialog.toCity) return false;
      if (transferDialog.toDistrict && branch.district !== transferDialog.toDistrict) return false;
      return true;
    }),
    [branchOptions, transferDialog.branchRow?.branchId, transferDialog.toProvince, transferDialog.toCity, transferDialog.toDistrict]
  );
  const selectedTransferDestinationBranch = useMemo(
    () => findBranchByIdentifier(branchOptions, transferDialog.toBranchId),
    [branchOptions, transferDialog.toBranchId]
  );

  // Get destination branch current stock for this item
  const getDestinationBranchStock = () => {
    if (!transferDialog.toBranchId || !transferDialog.branchRow?.parentItem) return 0;
    const inventoryBranches = transferDialog.branchRow.parentItem?.inventory_Info?.[0]?.branches || [];
    const destinationBranch = findBranchByIdentifier(branchOptions, transferDialog.toBranchId);
    const destBranch = destinationBranch
      ? findInventoryBranchRecord(inventoryBranches, destinationBranch)
      : inventoryBranches.find((b) => b.branchId === transferDialog.toBranchId);
    return Number(destBranch?.quantity || 0);
  };

  const handleTransferSubmit = async () => {
    try {
      const fromBranch = transferDialog.branchRow;
      const toBranch = branchOptions.find((branch) => branch.branchId === transferDialog.toBranchId);
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

      const transferPayload = {
        productId: fromBranch.parentItem?._id,
        fromBranchId: fromBranch.branchId,
        toBranchId: toBranch.branchId,
        quantity,
        notes: transferDialog.notes || `Transfer from ${fromBranch.branchName} to ${toBranch.name}`,
      };

      await handlers.handleTransferStock(transferPayload);
      closeTransferDialog();
      await branchHandlers.fetchData();
    } catch (error) {
      onError(error.message || 'Failed to transfer stock');
    }
  };

  const openCycleCountDialog = (branchRow) => {
    setCycleCountDialog({
      open: true,
      branchRow,
      countedQuantity: String(Number(branchRow?.quantity || 0)),
      notes: '',
    });
  };

  const closeCycleCountDialog = () => {
    setCycleCountDialog({
      open: false,
      branchRow: null,
      countedQuantity: '',
      notes: '',
    });
  };

  const handleCycleCountSubmit = async () => {
    try {
      const branchRow = cycleCountDialog.branchRow;
      const countedQuantity = Number(cycleCountDialog.countedQuantity || 0);

      if (!branchRow?.parentItem?._id) {
        onError('Select an inventory branch to count');
        return;
      }

      if (countedQuantity < 0) {
        onError('Counted quantity cannot be negative');
        return;
      }

      await handlers.handleCycleCount({
        productId: branchRow.parentItem._id,
        branchId: branchRow.branchId,
        countedQuantity,
        notes: cycleCountDialog.notes || '',
      });

      closeCycleCountDialog();
      await branchHandlers.fetchData();
    } catch (error) {
      onError(error.message || 'Failed to record cycle count');
    }
  };

  const handleOpenMovementHistory = async (branchRow) => {
    try {
      const resolvedBranch = findBranchByIdentifier(branchOptions, branchRow?.branchId);
      setMovementDialog({
        open: true,
        loading: true,
        rows: [],
        productName: branchRow?.parentItem?.name || branchRow?.name || '',
        branchLabel: resolvedBranch?.name || branchRow?.branchName || '',
      });

      const rows = await getInventoryMovementHistory(
        branchRow?.parentItem?._id || branchRow?.productId,
        resolvedBranch?.branchId || ''
      );

      setMovementDialog((prev) => ({
        ...prev,
        loading: false,
        rows,
      }));
    } catch (error) {
      setMovementDialog((prev) => ({
        ...prev,
        loading: false,
      }));
      onError(error.message || 'Failed to load movement history');
    }
  };

  const closeMovementDialog = () => {
    setMovementDialog({
      open: false,
      loading: false,
      rows: [],
      productName: '',
      branchLabel: '',
    });
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
  const filteredBranchInventory = useMemo(() => {
    const rows = Array.isArray(branchHandlers.branches) ? branchHandlers.branches : [];

    if (!branchScope.isRestrictedToAssignedBranches) {
      return rows;
    }

    const allowedBranchIds = new Set(branchOptions.flatMap(getBranchIdentifiers));
    return rows.filter((branch) =>
      getBranchIdentifiers(branch).some((identifier) => allowedBranchIds.has(identifier))
    );
  }, [branchHandlers.branches, branchOptions, branchScope.isRestrictedToAssignedBranches]);

  // Render function for expanded row content (branch sub-table)
  const renderExpandableRow = (row) => (
    <BranchStockTable
      inventoryItem={row}
      branches={branchOptions}
      provincesCities={scopedProvincesCities}
      permissions={permissions}
      onAddStock={openStockDialog}
      onRemoveStock={openStockDialog}
      onTransfer={openTransferDialog}
      onCycleCount={openCycleCountDialog}
      onViewHistory={handleOpenMovementHistory}
      onSaveBranchEntry={handleSaveBranchEntry}
      stockLoading={handlers.stockLoading}
      isRestrictedToAssignedBranches={branchScope.isRestrictedToAssignedBranches}
      scopeHelperText={scopeHelperText}
    />
  );

  const renderBranchExpandableRow = (branch) => (
    <BranchInventoryTable
      branch={branch}
      permissions={permissions}
      onAddStock={openStockDialog}
      onRemoveStock={openStockDialog}
      onTransfer={openTransferDialog}
      onCycleCount={openCycleCountDialog}
      onViewHistory={handleOpenMovementHistory}
      onSaveBranchEntry={handleSaveBranchInventoryEntry}
      stockLoading={handlers.stockLoading}
      isRestrictedToAssignedBranches={branchScope.isRestrictedToAssignedBranches}
      scopeHelperText={scopeHelperText}
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
  const cycleCountQuantity = Number(cycleCountDialog.countedQuantity || 0);
  const currentCountStock = Number(cycleCountDialog.branchRow?.quantity || 0);
  const cycleCountVariance = cycleCountQuantity - currentCountStock;

  return (
    <div className='flex flex-col gap-5'>
      {/* Header and Stats */}
      <InventoryHead
        inventoryListData={initialCardCounts}
      />

      <Alert severity={branchScope.isRestrictedToAssignedBranches ? 'info' : 'success'}>
        {scopeHelperText}
      </Alert>

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
            <Alert severity="info" sx={{ mb: 2 }}>
              {branchScope.isRestrictedToAssignedBranches
                ? 'Distribution is limited to your assigned branches. Use the extra filters to narrow by product, location type, or active status within that scope.'
                : 'Distribution respects the active company scope. Use the extra filters to narrow by product, location type, or active status.'}
            </Alert>
            <CustomListTable
              columns={branchTableColumns}
              rows={filteredBranchInventory}
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
              headerActions={(
                <Box className='flex flex-wrap gap-2'>
                  <TextField
                    size='small'
                    label='Product'
                    value={branchHandlers.filterValues?.searchProduct || ''}
                    onChange={(event) =>
                      branchHandlers.handleFilterChange('searchProduct', event.target.value)
                    }
                    sx={{ minWidth: 180 }}
                  />
                  <FormControl size='small' sx={{ minWidth: 140 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      label='Type'
                      value={branchHandlers.filterValues?.branchType || ''}
                      onChange={(event) =>
                        branchHandlers.handleFilterChange('branchType', event.target.value)
                      }
                    >
                      <MenuItem value=''>All</MenuItem>
                      <MenuItem value='Store'>Store</MenuItem>
                      <MenuItem value='Warehouse'>Warehouse</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size='small' sx={{ minWidth: 140 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      label='Status'
                      value={branchHandlers.filterValues?.status ?? ''}
                      onChange={(event) =>
                        branchHandlers.handleFilterChange('status', event.target.value)
                      }
                    >
                      <MenuItem value=''>All</MenuItem>
                      <MenuItem value='true'>Active</MenuItem>
                      <MenuItem value='false'>Inactive</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant='outlined'
                    color='secondary'
                    onClick={branchHandlers.resetFilters}
                  >
                    Reset
                  </Button>
                </Box>
              )}
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
                    {selectedTransferDestinationBranch?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {selectedTransferDestinationBranch?.province}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedTransferDestinationBranch?.city}
                    {selectedTransferDestinationBranch?.district
                      ? `, ${selectedTransferDestinationBranch?.district}`
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
                  {scopedProvincesCities.map((p) => (
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
                  <MenuItem value="" disabled>
                    {branchScope.isRestrictedToAssignedBranches
                      ? 'No assigned branches available'
                      : 'No branches available'}
                  </MenuItem>
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

            <TextField
              size='small'
              label='Transfer Notes'
              fullWidth
              multiline
              minRows={2}
              value={transferDialog.notes}
              onChange={(event) =>
                setTransferDialog((prev) => ({ ...prev, notes: event.target.value }))
              }
              sx={{ mt: 2 }}
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
              handlers.stockLoading?.transferStock
            }
          >
            {handlers.stockLoading?.transferStock
              ? 'Processing...'
              : 'Transfer Stock'
            }
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={cycleCountDialog.open} onClose={closeCycleCountDialog} maxWidth='sm' fullWidth>
        <DialogTitle>
          <Box className='flex items-center gap-2'>
            <Icon icon='mdi:clipboard-check-outline' width={22} color={theme.palette.warning.main} />
            <Typography variant='h6'>Cycle Count</Typography>
          </Box>
        </DialogTitle>
        <DialogContent className='flex flex-col gap-4'>
          <Box
            sx={{
              mt: 1,
              p: 2,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.warning.main, 0.06),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.12)}`,
            }}
          >
            <Typography variant='subtitle2' fontWeight={600}>
              {cycleCountDialog.branchRow?.branchName}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {cycleCountDialog.branchRow?.parentItem?.name}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Current stock: {currentCountStock} units
            </Typography>
          </Box>

          <TextField
            size='small'
            label='Counted Quantity *'
            type='number'
            fullWidth
            value={cycleCountDialog.countedQuantity}
            onChange={(event) =>
              setCycleCountDialog((prev) => ({
                ...prev,
                countedQuantity: event.target.value,
              }))
            }
            inputProps={{ min: 0 }}
          />

          <TextField
            size='small'
            label='Count Notes'
            fullWidth
            multiline
            minRows={2}
            value={cycleCountDialog.notes}
            onChange={(event) =>
              setCycleCountDialog((prev) => ({
                ...prev,
                notes: event.target.value,
              }))
            }
          />

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: alpha(
                cycleCountVariance >= 0 ? theme.palette.success.main : theme.palette.error.main,
                0.06
              ),
              border: `1px solid ${alpha(
                cycleCountVariance >= 0 ? theme.palette.success.main : theme.palette.error.main,
                0.12
              )}`,
            }}
          >
            <Typography variant='caption' color='text.secondary'>
              Variance preview
            </Typography>
            <Typography
              variant='h6'
              fontWeight={700}
              color={cycleCountVariance >= 0 ? 'success.main' : 'error.main'}
            >
              {cycleCountVariance > 0 ? '+' : ''}
              {cycleCountVariance}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCycleCountDialog} color='secondary'>
            Cancel
          </Button>
          <Button
            onClick={handleCycleCountSubmit}
            variant='contained'
            color='warning'
            disabled={cycleCountQuantity < 0 || handlers.stockLoading?.cycleCount}
          >
            {handlers.stockLoading?.cycleCount ? 'Saving...' : 'Record Count'}
          </Button>
        </DialogActions>
      </Dialog>

      <InventoryMovementDialog
        open={movementDialog.open}
        onClose={closeMovementDialog}
        rows={movementDialog.rows}
        loading={movementDialog.loading}
        title={movementDialog.productName ? `${movementDialog.productName} Movement History` : 'Movement History'}
        subtitle={movementDialog.branchLabel ? `Filtered to ${movementDialog.branchLabel}` : ''}
      />

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
