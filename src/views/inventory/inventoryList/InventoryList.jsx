'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import {
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
  Tabs,
  Tab,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

import InventoryHead from '@/views/inventory/inventoryList/inventoryHead';
import CustomListTable from '@/components/custom-components/CustomListTable';
import BranchStockTable from './BranchStockTable';
import BranchInventoryTable from './BranchInventoryTable';
import InventoryMovementDialog from './InventoryMovementDialog';
import AppSnackbar from '@/components/shared/AppSnackbar';
import { useInventoryListViewHandler } from './handler';

const DEFAULT_PAGINATION = { current: 1, pageSize: 10, total: 0 };

const InventoryList = ({
  initialInventory = [],
  initialPagination = DEFAULT_PAGINATION,
  initialCardCounts = {},
  initialBranchInventory = [],
  initialBranchPagination = DEFAULT_PAGINATION,
  initialBranches = [],
  initialProvincesCities = [],
  initialErrorMessage = '',
  filters: initialFilters = {},
  sortBy: initialSortBy = '',
  sortDirection: initialSortDirection = 'asc',
}) => {
  const theme = useTheme();
  const view = useInventoryListViewHandler({
    theme,
    initialInventory,
    initialPagination,
    initialBranchInventory,
    initialBranchPagination,
    initialBranches,
    initialProvincesCities,
    initialFilters,
    initialSortBy,
    initialSortDirection,
    initialErrorMessage,
  });

  const renderExpandableRow = (row) => (
    <BranchStockTable
      inventoryItem={row}
      branches={view.branchOptions}
      provincesCities={view.scopedProvincesCities}
      permissions={view.permissions}
      onAddStock={view.openStockDialog}
      onRemoveStock={view.openStockDialog}
      onTransfer={view.openTransferDialog}
      onCycleCount={view.openCycleCountDialog}
      onViewHistory={view.handleOpenMovementHistory}
      onSaveBranchEntry={view.handleSaveBranchEntry}
      stockLoading={view.handlers.stockLoading}
      isRestrictedToAssignedBranches={view.branchScope.isRestrictedToAssignedBranches}
    />
  );

  const renderBranchExpandableRow = (branch) => (
    <BranchInventoryTable
      branch={branch}
      permissions={view.permissions}
      onAddStock={view.openStockDialog}
      onRemoveStock={view.openStockDialog}
      onTransfer={view.openTransferDialog}
      onCycleCount={view.openCycleCountDialog}
      onViewHistory={view.handleOpenMovementHistory}
      onSaveBranchEntry={view.handleSaveBranchInventoryEntry}
      stockLoading={view.handlers.stockLoading}
      isRestrictedToAssignedBranches={view.branchScope.isRestrictedToAssignedBranches}
    />
  );

  return (
    <div className='flex flex-col gap-5'>
      <InventoryHead inventoryListData={initialCardCounts} />

      <Box sx={{ mb: 2 }}>
        <Tabs
          value={view.activeTab}
          onChange={(_, value) => view.setActiveTab(value)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Inventory" value="inventory" />
          <Tab label="Distribution" value="distribution" />
        </Tabs>
      </Box>

      {view.activeTab === 'inventory' && (
        <Grid container spacing={3}>
          <Grid size={12}>
            <CustomListTable
              columns={view.tableColumns}
              rows={view.filteredInventory}
              loading={view.handlers.loading}
              showSearch
              searchValue={view.handlers.searchTerm || ''}
              onSearchChange={view.handlers.handleSearchInputChange}
              searchPlaceholder="Search inventory..."
              pagination={view.tablePagination}
              onPageChange={view.handlers.handlePageChange}
              onRowsPerPageChange={view.handlers.handlePageSizeChange}
              onSort={view.handlers.handleSortRequest}
              sortBy={view.handlers.sortBy}
              sortDirection={view.handlers.sortDirection}
              noDataText="No inventory items found."
              rowKey={(row) => row._id || row.id}
              onRowClick={view.handleRowClick}
              getRowClassName={() => 'cursor-pointer'}
              expandedRows={view.expandedRows}
              expandableRowRender={renderExpandableRow}
            />
          </Grid>
        </Grid>
      )}

      {view.activeTab === 'distribution' && (
        <Grid container spacing={3}>
          <Grid size={12}>
            <CustomListTable
              columns={view.branchTableColumns}
              rows={view.filteredBranchInventory}
              loading={view.branchHandlers.loading}
              showSearch
              searchValue={view.branchHandlers.searchTerm || ''}
              onSearchChange={view.branchHandlers.handleSearchInputChange}
              searchPlaceholder="Search distribution..."
              pagination={view.branchTablePagination}
              onPageChange={view.branchHandlers.handlePageChange}
              onRowsPerPageChange={view.branchHandlers.handlePageSizeChange}
              onSort={view.branchHandlers.handleSortRequest}
              sortBy={view.branchHandlers.sortBy}
              sortDirection={view.branchHandlers.sortDirection}
              noDataText="No distribution locations found."
              rowKey={(row) => row._id || row.id}
              onRowClick={view.handleBranchRowClick}
              getRowClassName={() => 'cursor-pointer'}
              expandedRows={view.expandedBranchRows}
              expandableRowRender={renderBranchExpandableRow}
              headerActions={(
                <Box className='flex flex-wrap gap-2'>
                  <TextField
                    size='small'
                    label='Product'
                    value={view.branchHandlers.filterValues?.searchProduct || ''}
                    onChange={(event) =>
                      view.branchHandlers.handleFilterChange('searchProduct', event.target.value)
                    }
                    sx={{ minWidth: 180 }}
                  />
                  <FormControl size='small' sx={{ minWidth: 140 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      label='Type'
                      value={view.branchHandlers.filterValues?.branchType || ''}
                      onChange={(event) =>
                        view.branchHandlers.handleFilterChange('branchType', event.target.value)
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
                      value={view.branchHandlers.filterValues?.status ?? ''}
                      onChange={(event) =>
                        view.branchHandlers.handleFilterChange('status', event.target.value)
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
                    onClick={view.branchHandlers.resetFilters}
                  >
                    Reset
                  </Button>
                </Box>
              )}
            />
          </Grid>
        </Grid>
      )}

      <Popover
        open={view.stockDialog.open}
        anchorEl={view.stockDialog.anchorEl}
        onClose={view.closeStockDialog}
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
          },
        }}
      >
        <Box className="px-3 py-2.5">
          <Box className="flex items-center justify-between mb-2">
            <Box className="flex items-center gap-1.5">
              <Icon
                icon={view.stockDialog.type === 'add' ? 'mdi:plus-circle' : 'mdi:minus-circle'}
                width={18}
                color={view.stockDialog.type === 'add' ? theme.palette.success.main : theme.palette.error.main}
              />
              <Typography variant="subtitle2" fontWeight={600}>
                {view.stockDialog.type === 'add' ? 'Add Stock' : 'Remove Stock'}
              </Typography>
            </Box>
            <IconButton size="small" onClick={view.closeStockDialog} sx={{ p: 0.25 }}>
              <Icon icon="mdi:close" width={16} />
            </IconButton>
          </Box>

          <Box className="mb-2 p-2 rounded" sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
            <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
              Branch
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {view.stockDialog.branchRow?.branchName}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
              {view.stockDialog.branchRow?.province}, {view.stockDialog.branchRow?.city}
              {view.stockDialog.branchRow?.district ? `, ${view.stockDialog.branchRow.district}` : ''}
            </Typography>
          </Box>

          <Box className="flex items-center justify-center gap-2 mb-3">
            <Box className="text-center">
              <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                Current
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {view.currentBranchStock}
              </Typography>
            </Box>
            <Icon
              icon="mdi:arrow-right-thick"
              width={20}
              color={view.stockDialog.type === 'add' ? theme.palette.success.main : theme.palette.error.main}
            />
            <Box className="text-center">
              <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                After
              </Typography>
              <Typography
                variant="h6"
                fontWeight={600}
                color={view.stockDialog.type === 'add' ? 'success.main' : 'error.main'}
              >
                {view.stockDialogQuantity > 0 ? view.projectedBranchStock : '-'}
              </Typography>
            </Box>
          </Box>

          <TextField
            size="small"
            fullWidth
            label="Quantity"
            type="number"
            value={view.stockDialog.quantity}
            onChange={(event) => view.handleStockQuantityChange(event.target.value)}
            inputProps={{
              min: 1,
              ...(view.stockDialog.type === 'remove' && { max: view.currentBranchStock }),
            }}
            helperText={view.stockDialog.type === 'remove' ? `Max: ${view.currentBranchStock} units` : ''}
            sx={{ mb: 2 }}
          />

          <Box className="flex gap-1.5">
            <Button
              size="small"
              variant="outlined"
              onClick={view.closeStockDialog}
              sx={{ flex: 1, fontSize: '0.75rem' }}
            >
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              color={view.stockDialog.type === 'add' ? 'success' : 'error'}
              onClick={view.handleStockSubmit}
              disabled={
                view.stockDialogQuantity <= 0 ||
                view.handlers.stockLoading?.addStock ||
                view.handlers.stockLoading?.removeStock
              }
              sx={{ flex: 1, fontSize: '0.75rem' }}
            >
              {view.handlers.stockLoading?.[view.stockDialog.type === 'add' ? 'addStock' : 'removeStock']
                ? 'Processing...'
                : (view.stockDialog.type === 'add' ? 'Add' : 'Remove')}
            </Button>
          </Box>
        </Box>
      </Popover>

      <Dialog
        open={view.transferDialog.open}
        onClose={view.closeTransferDialog}
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
                {view.transferDialog.branchRow?.branchName}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {view.transferDialog.branchRow?.province}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {view.transferDialog.branchRow?.city}
                {view.transferDialog.branchRow?.district ? `, ${view.transferDialog.branchRow.district}` : ''}
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
                  {view.sourceStock} units
                </Typography>
              </Box>
            </Box>

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
              {view.transferQuantity > 0 && (
                <Typography variant="caption" fontWeight={600} color="info.main" sx={{ mt: 1 }}>
                  {view.transferQuantity} units
                </Typography>
              )}
            </Box>

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
              {view.transferDialog.toBranchId ? (
                <>
                  <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                    {view.selectedTransferDestinationBranch?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {view.selectedTransferDestinationBranch?.province}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {view.selectedTransferDestinationBranch?.city}
                    {view.selectedTransferDestinationBranch?.district
                      ? `, ${view.selectedTransferDestinationBranch?.district}`
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
                      {view.destStock} -&gt; {view.projectedDestStock} units
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

          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 1.5, display: 'block' }}>
              Filter Destination by Location
            </Typography>
            <Box className="flex gap-2 mb-2">
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel sx={{ fontSize: '0.75rem' }}>Province</InputLabel>
                <Select
                  label="Province"
                  value={view.transferDialog.toProvince}
                  onChange={(event) => view.updateTransferDialog('toProvince', event.target.value)}
                  sx={{ fontSize: '0.8rem' }}
                >
                  <MenuItem value=""><em>All</em></MenuItem>
                  {view.scopedProvincesCities.map((province) => (
                    <MenuItem key={province.province} value={province.province}>
                      {province.province}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ flex: 1 }} disabled={!view.transferDialog.toProvince}>
                <InputLabel sx={{ fontSize: '0.75rem' }}>City</InputLabel>
                <Select
                  label="City"
                  value={view.transferDialog.toCity}
                  onChange={(event) => view.updateTransferDialog('toCity', event.target.value)}
                  sx={{ fontSize: '0.8rem' }}
                >
                  <MenuItem value=""><em>All</em></MenuItem>
                  {view.transferCityOptions.map((city) => (
                    <MenuItem key={city.name} value={city.name}>
                      {city.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ flex: 1 }} disabled={!view.transferDialog.toCity}>
                <InputLabel sx={{ fontSize: '0.75rem' }}>District</InputLabel>
                <Select
                  label="District"
                  value={view.transferDialog.toDistrict}
                  onChange={(event) => view.updateTransferDialog('toDistrict', event.target.value)}
                  sx={{ fontSize: '0.8rem' }}
                >
                  <MenuItem value=""><em>All</em></MenuItem>
                  {view.transferDistrictOptions.map((district) => (
                    <MenuItem key={district} value={district}>
                      {district}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
              <InputLabel>Destination Branch *</InputLabel>
              <Select
                label="Destination Branch *"
                value={view.transferDialog.toBranchId}
                onChange={(event) => view.handleTransferDestinationChange(event.target.value)}
              >
                {view.transferFilteredBranches.length === 0 ? (
                  <MenuItem value="" disabled>
                    {view.branchScope.isRestrictedToAssignedBranches
                      ? 'No assigned branches available'
                      : 'No branches available'}
                  </MenuItem>
                ) : (
                  view.transferFilteredBranches.map((branch) => (
                    <MenuItem key={branch._id} value={branch._id}>
                      {branch.name} ({branch.branchType})
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <TextField
              size="small"
              label="Transfer Quantity *"
              type="number"
              fullWidth
              value={view.transferDialog.quantity}
              onChange={(event) => view.handleTransferQuantityChange(event.target.value)}
              inputProps={{ min: 1, max: view.sourceStock }}
              helperText={`Max: ${view.sourceStock} units available`}
            />

            <TextField
              size='small'
              label='Transfer Notes'
              fullWidth
              multiline
              minRows={2}
              value={view.transferDialog.notes}
              onChange={(event) => view.handleTransferNotesChange(event.target.value)}
              sx={{ mt: 2 }}
            />
          </Box>

          {view.transferDialog.toBranchId && view.transferQuantity > 0 && (
            <Box
              className="flex gap-4 p-3 rounded-lg"
              sx={{
                backgroundColor: alpha(theme.palette.info.main, 0.04),
                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
              }}
            >
              <Box className="flex-1 text-center">
                <Typography variant="caption" color="text.secondary" fontSize="0.65rem" textTransform="uppercase">
                  Source After Transfer
                </Typography>
                <Box className="flex items-center justify-center gap-1.5 mt-0.5">
                  <Typography variant="body1" fontWeight={500} color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                    {view.sourceStock}
                  </Typography>
                  <Icon icon="mdi:arrow-right" width={16} color={theme.palette.error.main} />
                  <Typography variant="h6" fontWeight={700} color="error.main">
                    {view.projectedSourceStock}
                  </Typography>
                </Box>
              </Box>
              <Box className="flex-1 text-center">
                <Typography variant="caption" color="text.secondary" fontSize="0.65rem" textTransform="uppercase">
                  Destination After Transfer
                </Typography>
                <Box className="flex items-center justify-center gap-1.5 mt-0.5">
                  <Typography variant="body1" fontWeight={500} color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                    {view.destStock}
                  </Typography>
                  <Icon icon="mdi:arrow-right" width={16} color={theme.palette.success.main} />
                  <Typography variant="h6" fontWeight={700} color="success.main">
                    {view.projectedDestStock}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={view.closeTransferDialog} color="secondary" size="small">
            Cancel
          </Button>
          <Button
            onClick={view.handleTransferSubmit}
            variant="contained"
            color="info"
            size="small"
            startIcon={<Icon icon="mdi:swap-horizontal" width={18} />}
            disabled={
              !view.transferDialog.toBranchId ||
              view.transferQuantity <= 0 ||
              view.transferQuantity > view.sourceStock ||
              view.handlers.stockLoading?.transferStock
            }
          >
            {view.handlers.stockLoading?.transferStock ? 'Processing...' : 'Transfer Stock'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={view.cycleCountDialog.open} onClose={view.closeCycleCountDialog} maxWidth='sm' fullWidth>
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
              {view.cycleCountDialog.branchRow?.branchName}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {view.cycleCountDialog.branchRow?.parentItem?.name}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Current stock: {view.currentCountStock} units
            </Typography>
          </Box>

          <TextField
            size='small'
            label='Counted Quantity *'
            type='number'
            fullWidth
            value={view.cycleCountDialog.countedQuantity}
            onChange={(event) => view.handleCycleCountQuantityChange(event.target.value)}
            inputProps={{ min: 0 }}
          />

          <TextField
            size='small'
            label='Count Notes'
            fullWidth
            multiline
            minRows={2}
            value={view.cycleCountDialog.notes}
            onChange={(event) => view.handleCycleCountNotesChange(event.target.value)}
          />

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: alpha(
                view.cycleCountVariance >= 0 ? theme.palette.success.main : theme.palette.error.main,
                0.06
              ),
              border: `1px solid ${alpha(
                view.cycleCountVariance >= 0 ? theme.palette.success.main : theme.palette.error.main,
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
              color={view.cycleCountVariance >= 0 ? 'success.main' : 'error.main'}
            >
              {view.cycleCountVariance > 0 ? '+' : ''}
              {view.cycleCountVariance}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={view.closeCycleCountDialog} color='secondary'>
            Cancel
          </Button>
          <Button
            onClick={view.handleCycleCountSubmit}
            variant='contained'
            color='warning'
            disabled={view.cycleCountQuantity < 0 || view.handlers.stockLoading?.cycleCount}
          >
            {view.handlers.stockLoading?.cycleCount ? 'Saving...' : 'Record Count'}
          </Button>
        </DialogActions>
      </Dialog>

      <InventoryMovementDialog
        open={view.movementDialog.open}
        onClose={view.closeMovementDialog}
        rows={view.movementDialog.rows}
        loading={view.movementDialog.loading}
        historyBranchId={view.movementDialog.branchId}
        title={view.movementDialog.productName ? `${view.movementDialog.productName} Movement History` : 'Movement History'}
        subtitle={view.movementDialog.branchLabel ? `Filtered to ${view.movementDialog.branchLabel}` : ''}
      />

      <AppSnackbar
        open={view.snackbar.open}
        message={view.snackbar.message}
        severity={view.snackbar.severity}
        onClose={view.handleSnackbarClose}
        autoHideDuration={6000}
      />
    </div>
  );
};

export default InventoryList;
