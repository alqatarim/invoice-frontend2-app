'use client';

import React, { useEffect, useState } from 'react';
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
import { getFilteredProducts } from '@/app/(dashboard)/products/actions';

/**
 * BranchInventoryTable - Sub-table for inventory items per branch
 */
const BranchInventoryTable = ({
  branch,
  permissions,
  onAddStock,
  onRemoveStock,
  onTransfer,
  onSaveBranchEntry,
  stockLoading,
}) => {
  const theme = useTheme();
  const isAnyLoading = stockLoading?.addStock || stockLoading?.removeStock;
  const inventoryItems = Array.isArray(branch?.inventoryItems) ? branch.inventoryItems : [];

  const [newRow, setNewRow] = useState(null);
  const [productOptions, setProductOptions] = useState([]);
  const [productInput, setProductInput] = useState('');
  const [productLoading, setProductLoading] = useState(false);

  useEffect(() => {
    if (!newRow || productOptions.length) return;
    const fetchProducts = async () => {
      setProductLoading(true);
      try {
        const response = await getFilteredProducts(1, 1000);
        setProductOptions(Array.isArray(response?.products) ? response.products : []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setProductLoading(false);
      }
    };
    fetchProducts();
  }, [newRow, productOptions.length]);

  const handleAddClick = (e, item) => {
    e.stopPropagation();
    if (onAddStock) {
      onAddStock('add', buildBranchRow(item), e.currentTarget);
    }
  };

  const handleRemoveClick = (e, item) => {
    e.stopPropagation();
    if (onRemoveStock) {
      onRemoveStock('remove', buildBranchRow(item), e.currentTarget);
    }
  };

  const handleTransferClick = (e, item) => {
    e.stopPropagation();
    if (onTransfer) {
      onTransfer(buildBranchRow(item));
    }
  };

  const buildBranchRow = (item) => ({
    rowType: 'branch',
    branchId: branch?.branchId,
    branchName: branch?.name,
    branchType: branch?.branchType,
    province: branch?.province,
    city: branch?.city,
    district: branch?.district,
    quantity: Number(item?.quantity || 0),
    parentItem: {
      _id: item?.productId,
      name: item?.name,
      sku: item?.sku,
      sellingPrice: item?.sellingPrice,
      purchasePrice: item?.purchasePrice,
      inventory_Info: [
        {
          branches: Array.isArray(item?.branches) ? item.branches : [],
          quantity: Number(item?.totalQuantity || 0),
        },
      ],
    },
  });

  const handleAddNewRow = () => {
    setNewRow({
      product: null,
      quantity: '',
    });
  };

  const handleCancelNewRow = () => {
    setNewRow(null);
    setProductInput('');
    // Keep product options cached for subsequent add entries
  };

  const handleSaveNewRow = async () => {
    if (!newRow?.product?._id || !newRow?.quantity) return;
    if (onSaveBranchEntry) {
      await onSaveBranchEntry({
        productId: newRow.product._id,
        quantity: Number(newRow.quantity),
        branchId: branch?.branchId,
        branchName: branch?.name,
        branchType: branch?.branchType,
        province: branch?.province,
        city: branch?.city,
        district: branch?.district,
      });
    }
    handleCancelNewRow();
  };

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
                <TableCell align="center" sx={{ width: 140 }}>Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {inventoryItems.length > 0 ? (
              inventoryItems.map((item, index) => (
                <TableRow key={item.productId || index}>
                  <TableCell>
                    <Typography variant="body2" color="text.primary">
                      {item.name || 'N/A'}
                    </Typography>
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
                      No inventory items found
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
                    onChange={(_, value) => setNewRow((prev) => ({ ...prev, product: value }))}
                    inputValue={productInput}
                    onInputChange={(_, value) => setProductInput(value)}
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
                    onChange={(e) => setNewRow((prev) => ({ ...prev, quantity: e.target.value }))}
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
