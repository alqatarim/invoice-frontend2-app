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
  FormControl,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import Chip from '@/components/custom-components/CustomChip';
import { Icon } from '@iconify/react';
import IconButton from '@core/components/mui/CustomIconButton';
import { useBranchStockTableHandler } from './handler';
/**
 * BranchStockTable - Sub-table for branch stock allocations
 * Displayed in the expanded section of inventory rows
 */
const BranchStockTable = ({
  inventoryItem,
  branches = [],
  provincesCities = [],
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
    isAnyLoading,
    inventoryInfo,
    batches,
    serialNumbers,
    recentTransfers,
    lastCycleCount,
    branchesWithStock,
    cityOptions,
    districtOptions,
    filteredBranches,
    selectSx,
    handleAddClick,
    handleRemoveClick,
    handleTransferClick,
    handleCycleCountClick,
    handleHistoryClick,
    handleAddNewRow,
    handleCancelNewRow,
    handleSaveNewRow,
    updateNewRow,
  } = useBranchStockTableHandler({
    theme,
    inventoryItem,
    branches,
    provincesCities,
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
      {/* Header */}
      <Box className="flex justify-between items-center mb-3">
        <Box className="flex items-center gap-1.5">
          <Icon icon="mdi:store" width={18} color={theme.palette.primary.main} />
          <Typography variant="subtitle2" fontWeight={600}>
            Branch Stock Allocations
          </Typography>
          <Chip
            size="small"
            label={`${branchesWithStock.length} branch${branchesWithStock.length !== 1 ? 'es' : ''}`}
            variant="tonal"
            color="secondary"
            sx={{ height: 20, fontSize: '0.7rem' }}
          />

          <Chip
            size='small'
            label={`Valuation: ${inventoryInfo?.valuationMethod || 'FIFO'}`}
            variant='tonal'
            color='primary'
            sx={{ height: 20, fontSize: '0.7rem' }}
          />
        </Box>
      </Box>



      {/* Temporarily hidden. Keep for future inventory metadata display.
        <Chip
          size='small'
          label={`Batches: ${batches.length}`}
          variant='outlined'
          color='secondary'
        />
        <Chip
          size='small'
          label={`Serials: ${serialNumbers.length}`}
          variant='outlined'
          color='secondary'
        />
        <Chip
          size='small'
          label={`Transfers: ${recentTransfers.length}`}
          variant='outlined'
          color='info'
        />
        */}
      {lastCycleCount?.branchId ? (
        <Chip
          size='small'
          label={`Last Count: ${Number(lastCycleCount.countedQuantity || 0)} (${lastCycleCount.variance > 0 ? '+' : ''}${Number(lastCycleCount.variance || 0)})`}
          variant='outlined'
          color={Number(lastCycleCount.variance || 0) === 0 ? 'success' : 'warning'}
        />
      ) : null}


      {/* Temporarily hidden. Keep for future transfer/serial summary display.
      {(recentTransfers.length > 0 || serialNumbers.length > 0) && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.16)}`,
            backgroundColor: alpha(theme.palette.background.default, 0.4),
          }}
        >
          {lastCycleCount?.branchId ? (
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
              Last cycle count was recorded for {lastCycleCount.branchId} with a variance of{' '}
              {lastCycleCount.variance > 0 ? '+' : ''}
              {Number(lastCycleCount.variance || 0)}.
            </Typography>
          ) : null}
          {recentTransfers.length > 0 ? (
            <Typography variant='body2' color='text.secondary'>
              Recent transfers: {recentTransfers.map((entry) => `${entry.fromBranchName || entry.fromBranchId} -> ${entry.toBranchName || entry.toBranchId} (${entry.quantity})`).join(' | ')}
            </Typography>
          ) : null}
          {!recentTransfers.length && serialNumbers.length > 0 ? (
            <Typography variant='body2' color='text.secondary'>
              Serial tracking is enabled for this item with {serialNumbers.length} recorded serial number{serialNumbers.length === 1 ? '' : 's'}.
            </Typography>
          ) : null}
        </Box>
      )}
      */}

      {/* Branch Table - Override inherited styles from parent table */}
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
            // Reset inherited styles from parent table with !important
            '& thead': {
              textTransform: 'none !important',
            },
            '& thead th': {
              fontSize: '0.75rem !important',
              fontWeight: '600 !important',
              height: 'auto !important',
              minHeight: '36px !important',
              blockSize: 'auto !important',
              lineHeight: '1.5 !important',
              padding: '8px 12px !important',
              backgroundColor: `${theme.palette.background.paper} !important`,
              color: `${theme.palette.text.secondary} !important`,
            },
            '& tbody td': {
              fontSize: '0.8rem !important',
              height: 'auto !important',
              minHeight: '40px !important',
              blockSize: 'auto !important',
              padding: '6px 12px !important',

            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 200 }}>Branch</TableCell>
              <TableCell align="center" sx={{ width: 110 }}>Type</TableCell>
              <TableCell sx={{ width: 150 }}>Province</TableCell>
              <TableCell sx={{ width: 140 }}>City</TableCell>
              <TableCell sx={{ width: 140 }}>District</TableCell>
              <TableCell align="center" sx={{ width: 90 }}>Quantity</TableCell>
              {permissions?.canUpdate && (
                <TableCell align="center" sx={{ width: 210 }}>Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {branchesWithStock.length > 0 ? (
              branchesWithStock.map((branch, index) => (
                <TableRow key={branch._id || index}>
                  <TableCell>{branch.branchName || 'N/A'}</TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={branch.branchType || '-'}
                      color={branch.branchType === 'Store' ? 'primary' : 'warning'}
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  <TableCell>{branch.province || '-'}</TableCell>
                  <TableCell>{branch.city || '-'}</TableCell>
                  <TableCell>{branch.district || '-'}</TableCell>
                  <TableCell align="center">
                    <Typography fontWeight={600} color="text.primary">
                      {branch.quantity || 0}
                    </Typography>
                  </TableCell>
                  {permissions?.canUpdate && (
                    <TableCell align="center">
                      <Box className="flex items-center justify-center gap-1">
                        <Tooltip title="Add Stock" arrow>
                          <IconButton
                            size="small"
                            onClick={(e) => handleAddClick(e, branch)}
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
                            onClick={(e) => handleRemoveClick(e, branch)}
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
                            onClick={(e) => handleTransferClick(e, branch)}
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
                            onClick={(e) => handleCycleCountClick(e, branch)}
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
                            onClick={(e) => handleHistoryClick(e, branch)}
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
                    <Icon icon="mdi:store-off-outline" width={28} color={theme.palette.text.secondary} style={{ marginBottom: 4 }} />
                    <Typography variant="body2" color="textSecondary">
                      {isRestrictedToAssignedBranches
                        ? 'No branch allocations found in your assigned scope'
                        : 'No branch allocations found'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : null}

            {/* New Row for Adding Branch */}
            {newRow && (
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                <TableCell>
                  {newRow.city ? (
                    <FormControl size="small" fullWidth sx={{ minWidth: 0 }}>
                      <Select
                        value={newRow.branchId}
                        onChange={(e) => updateNewRow('branchId', e.target.value)}
                        displayEmpty
                        sx={selectSx}
                      >
                        <MenuItem value="" disabled>
                          <Typography color="text.secondary" fontSize="0.8rem">
                            {isRestrictedToAssignedBranches ? 'Select Assigned Branch' : 'Select Branch'}
                          </Typography>
                        </MenuItem>
                        {filteredBranches.map((branch) => (
                          <MenuItem key={branch._id} value={branch._id} sx={{ fontSize: '0.8rem' }}>
                            {branch.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Typography color="text.secondary" fontSize="0.8rem">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  {newRow.branchId ? (
                    <Chip
                      size="small"
                      label={branches.find(b => String(b._id || '') === newRow.branchId)?.branchType || '-'}
                      color={branches.find(b => String(b._id || '') === newRow.branchId)?.branchType === 'Store' ? 'primary' : 'secondary'}
                      variant="tonal"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  ) : (
                    <Typography color="text.secondary">-</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <FormControl size="small" fullWidth sx={{ minWidth: 0 }}>
                    <Select
                      value={newRow.province}
                      onChange={(e) => updateNewRow('province', e.target.value)}
                      displayEmpty
                      sx={selectSx}
                    >
                      <MenuItem value="" disabled>
                        <Typography color="text.secondary" fontSize="0.8rem">Province</Typography>
                      </MenuItem>
                      {provincesCities.map((p) => (
                        <MenuItem key={p.province} value={p.province} sx={{ fontSize: '0.8rem' }}>
                          {p.province}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <FormControl size="small" fullWidth sx={{ minWidth: 0 }} disabled={!newRow.province}>
                    <Select
                      value={newRow.city}
                      onChange={(e) => updateNewRow('city', e.target.value)}
                      displayEmpty
                      sx={selectSx}
                    >
                      <MenuItem value="" disabled>
                        <Typography color="text.secondary" fontSize="0.8rem">City</Typography>
                      </MenuItem>
                      {cityOptions.map((c) => (
                        <MenuItem key={c.name} value={c.name} sx={{ fontSize: '0.8rem' }}>
                          {c.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <FormControl size="small" fullWidth sx={{ minWidth: 0 }} disabled={!newRow.city}>
                    <Select
                      value={newRow.district}
                      onChange={(e) => updateNewRow('district', e.target.value)}
                      displayEmpty
                      sx={selectSx}
                    >
                      <MenuItem value="">
                        <Typography color="text.secondary" fontSize="0.8rem">None</Typography>
                      </MenuItem>
                      {districtOptions.map((d) => (
                        <MenuItem key={d} value={d} sx={{ fontSize: '0.8rem' }}>
                          {d}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell align="center">
                  <TextField
                    size="small"
                    type="number"
                    value={newRow.quantity}
                    onChange={(e) => updateNewRow('quantity', e.target.value)}
                    placeholder="Qty"
                    disabled={!newRow.branchId}
                    inputProps={{
                      min: 1,
                      style: {
                        textAlign: 'center',
                        padding: '6px 8px',
                        fontSize: '0.8rem',
                      }
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
                          disabled={!newRow.branchId || !newRow.quantity || isAnyLoading}
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
                            color={(!newRow.branchId || !newRow.quantity) ? theme.palette.grey[400] : theme.palette.success.main}
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

            {/* Add Entry Button Row (Bottom) */}
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
                    {isRestrictedToAssignedBranches ? 'Add Scoped Entry' : 'Add Entry'}
                  </Button>
                </TableCell>
                <TableCell colSpan={permissions?.canUpdate ? 6 : 5} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box >
  );
};

export default BranchStockTable;
