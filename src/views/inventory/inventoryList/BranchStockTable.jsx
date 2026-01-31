'use client';

import React, { useState, useMemo } from 'react';
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
  // IconButton,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
  TextField,
  // Chip,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import Chip from '@/components/custom-components/CustomChip';
import { Icon } from '@iconify/react';
import IconButton from '@core/components/mui/CustomIconButton';
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
  onSaveBranchEntry,
  stockLoading,
}) => {
  const theme = useTheme();
  const isAnyLoading = stockLoading?.addStock || stockLoading?.removeStock;

  // State for new row being added
  const [newRow, setNewRow] = useState(null);

  // Filter branches with stock > 0
  const branchesWithStock = (inventoryItem?.inventory_Info?.[0]?.branches || [])
    .filter((branch) => Number(branch?.quantity || 0) > 0);

  // Get cascading options for new row
  const provinceDoc = useMemo(() =>
    provincesCities.find((p) => p.province === newRow?.province),
    [provincesCities, newRow?.province]
  );
  const cityOptions = provinceDoc?.cities || [];
  const cityDoc = useMemo(() =>
    cityOptions.find((c) => c.name === newRow?.city),
    [cityOptions, newRow?.city]
  );
  const districtOptions = cityDoc?.districts || [];
  const filteredBranches = useMemo(() =>
    branches.filter((branch) => {
      if (newRow?.province && branch.province !== newRow.province) return false;
      if (newRow?.city && branch.city !== newRow.city) return false;
      if (newRow?.district && branch.district !== newRow.district) return false;
      return true;
    }),
    [branches, newRow?.province, newRow?.city, newRow?.district]
  );

  const handleAddClick = (e, branch) => {
    e.stopPropagation();
    if (onAddStock) {
      onAddStock('add', {
        rowType: 'branch',
        ...branch,
        parentItem: inventoryItem,
      }, e.currentTarget);
    }
  };

  const handleRemoveClick = (e, branch) => {
    e.stopPropagation();
    if (onRemoveStock) {
      onRemoveStock('remove', {
        rowType: 'branch',
        ...branch,
        parentItem: inventoryItem,
      }, e.currentTarget);
    }
  };

  const handleTransferClick = (e, branch) => {
    e.stopPropagation();
    if (onTransfer) {
      onTransfer({
        rowType: 'branch',
        ...branch,
        parentItem: inventoryItem,
      });
    }
  };

  const handleAddNewRow = () => {
    setNewRow({
      province: '',
      city: '',
      district: '',
      branchId: '',
      quantity: '',
    });
  };

  const handleCancelNewRow = () => {
    setNewRow(null);
  };

  const handleSaveNewRow = async () => {
    if (!newRow?.branchId || !newRow?.quantity) return;

    const selectedBranch = branches.find((b) => b.branchId === newRow.branchId);
    if (!selectedBranch) return;

    if (onSaveBranchEntry) {
      await onSaveBranchEntry({
        productId: inventoryItem._id,
        branchId: selectedBranch.branchId,
        branchName: selectedBranch.name,
        branchType: selectedBranch.branchType,
        province: selectedBranch.province,
        city: selectedBranch.city,
        district: selectedBranch.district,
        quantity: Number(newRow.quantity),
      });
    }
    setNewRow(null);
  };

  const updateNewRow = (field, value) => {
    setNewRow((prev) => {
      const updated = { ...prev, [field]: value };
      // Reset dependent fields when parent changes
      if (field === 'province') {
        updated.city = '';
        updated.district = '';
        updated.branchId = '';
      } else if (field === 'city') {
        updated.district = '';
        updated.branchId = '';
      } else if (field === 'district') {
        updated.branchId = '';
      }
      return updated;
    });
  };

  // Select styles for new row - matches table body font size
  const selectSx = {
    fontSize: '0.8rem',
    '& .MuiSelect-select': {
      py: 0.75,
      px: 1.5,
      fontSize: '0.8rem',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: alpha(theme.palette.primary.main, 0.3),
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
  };

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
            variant="outlined"
            color="secondary"
            sx={{ height: 20, fontSize: '0.7rem' }}
          />
        </Box>
      </Box>

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
                <TableCell align="center" sx={{ width: 140 }}>Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {branchesWithStock.length > 0 ? (
              branchesWithStock.map((branch, index) => (
                <TableRow key={branch.branchId || index}>
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
                          // sx={{
                          //   backgroundColor: alpha(theme.palette.info.main, 0.1),
                          //   border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                          //   borderRadius: 1.5,
                          //   '&:hover': {
                          //     backgroundColor: alpha(theme.palette.info.main, 0.2),
                          //   },
                          // }}
                          >
                            <Icon icon="mdi:swap-horizontal" width={18} color={theme.palette.info.main} />
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
                      No branch allocations found
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : null}

            {/* New Row for Adding Branch */}
            {newRow && (
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                <TableCell>
                  <FormControl size="small" fullWidth sx={{ minWidth: 0 }}>
                    <Select
                      value={newRow.branchId}
                      onChange={(e) => updateNewRow('branchId', e.target.value)}
                      displayEmpty
                      disabled={!newRow.city}
                      sx={selectSx}
                    >
                      <MenuItem value="" disabled>
                        <Typography color="text.secondary" fontSize="0.8rem">Select Branch</Typography>
                      </MenuItem>
                      {filteredBranches.map((branch) => (
                        <MenuItem key={branch.branchId} value={branch.branchId} sx={{ fontSize: '0.8rem' }}>
                          {branch.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell align="center">
                  {newRow.branchId ? (
                    <Chip
                      size="small"
                      label={branches.find(b => b.branchId === newRow.branchId)?.branchType || '-'}
                      color={branches.find(b => b.branchId === newRow.branchId)?.branchType === 'Store' ? 'primary' : 'secondary'}
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
                    Add Entry
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
