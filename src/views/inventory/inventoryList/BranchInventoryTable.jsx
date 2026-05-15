'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Box,
  Typography,
  Button,
  Tooltip,
  TextField,
  Autocomplete,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import Chip from '@/components/custom-components/CustomChip';
import IconButton from '@core/components/mui/CustomIconButton';
import { useBranchInventoryTableHandler } from './handler';

/**
 * BranchInventoryTable - Sub-table for inventory items per branch
 */
const BranchInventoryTable = ({
  branch,
  permissions,
  onAddStock,
  onRemoveStock,
  onTransfer,
  onCycleCount,
  onViewHistory,
  onSaveBranchEntry,
  stockLoading,
  isRestrictedToAssignedBranches = false,
}) => {
  const theme = useTheme();
  const {
    newRow,
    productOptions,
    productInput,
    productLoading,
    isAnyLoading,
    inventoryItems,
    handleAddClick,
    handleRemoveClick,
    handleTransferClick,
    handleCycleCountClick,
    handleHistoryClick,
    handleAddNewRow,
    handleCancelNewRow,
    handleProductChange,
    handleProductInputChange,
    handleQuantityChange,
    handleSaveNewRow,
  } = useBranchInventoryTableHandler({
    branch,
    stockLoading,
    onAddStock,
    onRemoveStock,
    onTransfer,
    onCycleCount,
    onViewHistory,
    onSaveBranchEntry,
  });

  return (
    <Box sx={{ ml: 4, mr: 2, mt: 3, mb: 6 }}>
      <Box className="flex justify-between items-center mb-3">
        <Box className="flex items-center gap-1.5">
          <Icon icon="mdi:package-variant" width={18} color={theme.palette.primary.main} />
          <Typography variant="subtitle2" fontWeight={600}>
            Distribution Inventory
          </Typography>
          <Chip
            size="small"
            label={isRestrictedToAssignedBranches ? 'Assigned Branch Scope' : 'Company Scope'}
            variant="tonal"
            color={isRestrictedToAssignedBranches ? 'info' : 'primary'}
            sx={{ height: 20, fontSize: '0.7rem' }}
          />
          <Chip
            size="small"
            label={`${inventoryItems.length} item${inventoryItems.length !== 1 ? 's' : ''}`}
            variant="outlined"
            color="secondary"
            sx={{ height: 20, fontSize: '0.7rem' }}
          />
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        variant="outlined"
        onClick={(e) => e.stopPropagation()}
      >
        <Table
          size="small"
          sx={{
            tableLayout: 'fixed',
            width: '100%',
            '& thead th': {
              fontSize: '0.75rem !important',
              fontWeight: '600 !important',
              padding: '8px 12px !important',
              backgroundColor: `${theme.palette.background.paper} !important`,
              color: `${theme.palette.text.secondary} !important`,
            },
            '& tbody td': {
              fontSize: '0.8rem !important',
              padding: '6px 12px !important',
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 220 }}>Item</TableCell>
              <TableCell sx={{ width: 120 }}>SKU</TableCell>
              <TableCell align="center" sx={{ width: 100 }}>Units</TableCell>
              <TableCell sx={{ width: 140 }}>Sales Price</TableCell>
              <TableCell sx={{ width: 150 }}>Purchase Price</TableCell>
              <TableCell align="center" sx={{ width: 90 }}>Quantity</TableCell>
              {permissions?.canUpdate && (
                <TableCell align="center" sx={{ width: 220 }}>Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {inventoryItems.length > 0 ? (
              inventoryItems.map((item, index) => (
                <TableRow key={item.productId || index}>
                  <TableCell>
                    <Box className='flex flex-col'>
                      <Typography variant="body2" color="text.primary">
                        {item.name || 'N/A'}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {(item.valuationMethod || 'FIFO')} | {Array.isArray(item.batches) ? item.batches.length : 0} batches | {Array.isArray(item.serialNumbers) ? item.serialNumbers.length : 0} serials
                      </Typography>
                      {item.lastCycleCount?.branchId ? (
                        <Typography variant='caption' color='text.secondary'>
                          Last count: {Number(item.lastCycleCount.countedQuantity || 0)} ({Number(item.lastCycleCount.variance || 0) > 0 ? '+' : ''}{Number(item.lastCycleCount.variance || 0)})
                        </Typography>
                      ) : null}
                    </Box>
                  </TableCell>
                  <TableCell>{item.sku || '-'}</TableCell>
                  <TableCell align="center">{item.unitInfo?.[0]?.name || '-'}</TableCell>
                  <TableCell>
                    <Box className="flex items-center gap-1">
                      <Icon icon="lucide:saudi-riyal" width="0.9rem" color={theme.palette.secondary.light} />
                      <Typography variant="body2">
                        {Number(item.sellingPrice || 0).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box className="flex items-center gap-1">
                      <Icon icon="lucide:saudi-riyal" width="0.9rem" color={theme.palette.secondary.light} />
                      <Typography variant="body2">
                        {Number(item.purchasePrice || 0).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography fontWeight={600} color="text.primary">
                      {item.quantity || 0}
                    </Typography>
                  </TableCell>
                  {permissions?.canUpdate && (
                    <TableCell align="center">
                      <Box className="flex items-center justify-center gap-1">
                        <Tooltip title="Add Stock" arrow>
                          <IconButton
                            size="small"
                            onClick={(e) => handleAddClick(e, item)}
                            disabled={isAnyLoading}
                            sx={{
                              backgroundColor: alpha(theme.palette.success.main, 0.1),
                              border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                              borderRadius: 1.5,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.success.main, 0.2),
                              },
                            }}
                          >
                            <Icon icon="mdi:plus" width={18} color={theme.palette.success.main} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove Stock" arrow>
                          <IconButton
                            size="small"
                            onClick={(e) => handleRemoveClick(e, item)}
                            disabled={isAnyLoading}
                            sx={{
                              backgroundColor: alpha(theme.palette.error.main, 0.1),
                              border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                              borderRadius: 1.5,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.error.main, 0.2),
                              },
                            }}
                          >
                            <Icon icon="mdi:minus" width={18} color={theme.palette.error.main} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Transfer Stock" arrow>
                          <IconButton
                            size="small"
                            onClick={(e) => handleTransferClick(e, item)}
                            disabled={isAnyLoading}
                            color="info"
                            skin="light"
                            variant="tonal"
                          >
                            <Icon icon="mdi:swap-horizontal" width={18} color={theme.palette.info.main} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cycle Count" arrow>
                          <IconButton
                            size="small"
                            onClick={(e) => handleCycleCountClick(e, item)}
                            disabled={isAnyLoading}
                            color="warning"
                            skin="light"
                            variant="tonal"
                          >
                            <Icon icon="mdi:clipboard-check-outline" width={18} color={theme.palette.warning.main} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Movement History" arrow>
                          <IconButton
                            size="small"
                            onClick={(e) => handleHistoryClick(e, item)}
                            disabled={isAnyLoading}
                            color="secondary"
                            skin="light"
                            variant="tonal"
                          >
                            <Icon icon="mdi:timeline-clock-outline" width={18} color={theme.palette.secondary.main} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : !newRow ? (
              <TableRow>
                <TableCell colSpan={permissions?.canUpdate ? 7 : 6} align="center">
                  <Box className="py-4">
                    <Icon icon="mdi:package-variant-closed" width={28} color={theme.palette.text.secondary} style={{ marginBottom: 4 }} />
                    <Typography variant="body2" color="textSecondary">
                      {isRestrictedToAssignedBranches
                        ? 'No inventory items found in this assigned branch'
                        : 'No inventory items found'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : null}

            {newRow && (
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                <TableCell>
                  <Autocomplete
                    size="small"
                    options={productOptions}
                    loading={productLoading}
                    value={newRow.product}
                    onChange={(_, value) => handleProductChange(value)}
                    inputValue={productInput}
                    onInputChange={(_, value) => handleProductInputChange(value)}
                    getOptionLabel={(option) => `${option.name || 'N/A'} (${option.sku || 'N/A'})`}
                    isOptionEqualToValue={(option, value) => option._id === value?._id}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Type to filter products"
                        size="small"
                        sx={{ fontSize: '0.8rem' }}
                      />
                    )}
                  />
                </TableCell>
                <TableCell>-</TableCell>
                <TableCell align="center">-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell align="center">
                  <TextField
                    size="small"
                    type="number"
                    value={newRow.quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    placeholder="Qty"
                    inputProps={{
                      min: 1,
                      style: { textAlign: 'center', padding: '6px 8px', fontSize: '0.8rem' },
                    }}
                    sx={{
                      width: 80,
                      '& .MuiOutlinedInput-root': {
                        fontSize: '0.8rem',
                        '& fieldset': {
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                        },
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                    }}
                  />
                </TableCell>
                {permissions?.canUpdate && (
                  <TableCell align="center">
                    <Box className="flex items-center justify-center gap-1">
                      <Tooltip title="Save" arrow>
                        <IconButton
                          size="small"
                          onClick={handleSaveNewRow}
                          disabled={!newRow.product || !newRow.quantity || isAnyLoading}
                          sx={{
                            backgroundColor: alpha(theme.palette.success.main, 0.1),
                            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                            borderRadius: 1.5,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.success.main, 0.2),
                            },
                            '&.Mui-disabled': {
                              backgroundColor: alpha(theme.palette.grey[500], 0.1),
                              border: `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
                            },
                          }}
                        >
                          <Icon
                            icon="mdi:check"
                            width={18}
                            color={(!newRow.product || !newRow.quantity)
                              ? theme.palette.grey[400]
                              : theme.palette.success.main}
                          />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cancel" arrow>
                        <IconButton
                          size="small"
                          onClick={handleCancelNewRow}
                          sx={{
                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                            border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                            borderRadius: 1.5,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.error.main, 0.2),
                            },
                          }}
                        >
                          <Icon icon="mdi:close" width={18} color={theme.palette.error.main} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            )}

            {permissions?.canUpdate && !newRow && (
              <TableRow>
                <TableCell>
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<Icon icon="mdi:plus" width={16} />}
                    onClick={handleAddNewRow}
                    disabled={isAnyLoading}
                    sx={{
                      fontSize: '0.75rem',
                      color: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    Add Entry
                  </Button>
                </TableCell>
                <TableCell colSpan={permissions?.canUpdate ? 6 : 5} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BranchInventoryTable;
