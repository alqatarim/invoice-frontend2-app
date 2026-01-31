'use client';

import React, { useMemo, useState } from 'react';
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
  Chip,
  IconButton,
  TextField,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';

const ProductVariantsTable = ({ product, variants = [], canEdit = false, onSaveVariants }) => {
  const theme = useTheme();
  const [editingKey, setEditingKey] = useState(null);
  const [draft, setDraft] = useState({});
  const [savingKey, setSavingKey] = useState(null);

  const getVariantKey = (variant, index) => variant?.id || variant?._id || `${index}`;

  const formatPrice = (value) => Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const inputSx = useMemo(() => ({
    '& .MuiOutlinedInput-root': {
      fontSize: '0.8rem',
      '& input': { padding: '6px 10px' },
    },
  }), []);

  const handleEditStart = (variant, index) => {
    const attributes = variant?.attributes || {};
    setEditingKey(getVariantKey(variant, index));
    setDraft({
      name: variant.name || '',
      sku: variant.sku || '',
      size: attributes.size || variant.size || '',
      color: attributes.color || variant.color || '',
      sellingPrice: String(variant.sellingPrice ?? ''),
      purchasePrice: String(variant.purchasePrice ?? ''),
    });
  };

  const handleEditCancel = () => {
    setEditingKey(null);
    setDraft({});
  };

  const handleSave = async (variant, index) => {
    if (!onSaveVariants) {
      handleEditCancel();
      return;
    }
    const key = getVariantKey(variant, index);
    setSavingKey(key);
    const updatedVariant = {
      ...variant,
      name: draft.name?.trim() || 'Variant',
      sku: draft.sku?.trim() || undefined,
      sellingPrice: Number(draft.sellingPrice || 0),
      purchasePrice: Number(draft.purchasePrice || 0),
      attributes: {
        size: draft.size?.trim() || undefined,
        color: draft.color?.trim() || undefined,
      },
    };

    const nextVariants = variants.map((item, idx) => (
      getVariantKey(item, idx) === key ? updatedVariant : item
    ));

    const result = await onSaveVariants(product, nextVariants);
    setSavingKey(null);
    if (result?.success !== false) {
      handleEditCancel();
    }
  };

  return (
    <Box sx={{ ml: 4, mr: 2, mt: 3, mb: 4 }}>
      <Box className="flex justify-between items-center mb-3">
        <Box className="flex items-center gap-1.5">
          <Icon icon="mdi:layers-outline" width={18} color={theme.palette.primary.main} />
          <Typography variant="subtitle2" fontWeight={600}>
            Variants
          </Typography>
          <Chip
            size="small"
            label={`${variants.length} variant${variants.length !== 1 ? 's' : ''}`}
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
              <TableCell sx={{ width: 220 }}>Variant</TableCell>
              <TableCell sx={{ width: 140 }}>SKU</TableCell>
              <TableCell sx={{ width: 180 }}>Attributes</TableCell>
              <TableCell sx={{ width: 140 }}>Selling Price</TableCell>
              <TableCell sx={{ width: 150 }}>Purchase Price</TableCell>
              {canEdit && <TableCell align="center" sx={{ width: 110 }}>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {variants.length > 0 ? (
              variants.map((variant, index) => {
                const key = getVariantKey(variant, index);
                const isEditing = editingKey === key;
                const isSaving = savingKey === key;
                const attributes = variant?.attributes || {};
                const size = attributes.size || variant.size;
                const color = attributes.color || variant.color;
                return (
                  <TableRow key={key}>
                    <TableCell>
                      {isEditing ? (
                        <TextField
                          size="small"
                          fullWidth
                          value={draft.name}
                          onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="Variant name"
                          sx={inputSx}
                        />
                      ) : (
                        <Typography variant="body2" color="text.primary">
                          {variant.name || 'Variant'}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <TextField
                          size="small"
                          fullWidth
                          value={draft.sku}
                          onChange={(e) => setDraft((prev) => ({ ...prev, sku: e.target.value }))}
                          placeholder="SKU"
                          sx={inputSx}
                        />
                      ) : (
                        variant.sku || '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Box className="flex flex-col gap-1">
                          <TextField
                            size="small"
                            fullWidth
                            value={draft.size}
                            onChange={(e) => setDraft((prev) => ({ ...prev, size: e.target.value }))}
                            placeholder="Size"
                            sx={inputSx}
                          />
                          <TextField
                            size="small"
                            fullWidth
                            value={draft.color}
                            onChange={(e) => setDraft((prev) => ({ ...prev, color: e.target.value }))}
                            placeholder="Color"
                            sx={inputSx}
                          />
                        </Box>
                      ) : (
                        <Box className="flex flex-wrap gap-1">
                          {size && (
                            <Chip
                              size="small"
                              label={`Size: ${size}`}
                              variant="outlined"
                              color="secondary"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          )}
                          {color && (
                            <Chip
                              size="small"
                              label={`Color: ${color}`}
                              variant="outlined"
                              color="secondary"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          )}
                          {!size && !color && (
                            <Typography variant="caption" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <TextField
                          size="small"
                          fullWidth
                          type="number"
                          value={draft.sellingPrice}
                          onChange={(e) => setDraft((prev) => ({ ...prev, sellingPrice: e.target.value }))}
                          placeholder="0"
                          sx={inputSx}
                        />
                      ) : (
                        <Box className="flex items-center gap-1">
                          <Icon icon="lucide:saudi-riyal" width="0.9rem" color={theme.palette.secondary.light} />
                          <Typography variant="body2">
                            {formatPrice(variant.sellingPrice)}
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <TextField
                          size="small"
                          fullWidth
                          type="number"
                          value={draft.purchasePrice}
                          onChange={(e) => setDraft((prev) => ({ ...prev, purchasePrice: e.target.value }))}
                          placeholder="0"
                          sx={inputSx}
                        />
                      ) : (
                        <Box className="flex items-center gap-1">
                          <Icon icon="lucide:saudi-riyal" width="0.9rem" color={theme.palette.secondary.light} />
                          <Typography variant="body2">
                            {formatPrice(variant.purchasePrice)}
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    {canEdit && (
                      <TableCell align="center">
                        {isEditing ? (
                          <Box className="flex items-center justify-center gap-1">
                            <Tooltip title="Save" arrow>
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleSave(variant, index)}
                                  disabled={isSaving}
                                >
                                  {isSaving ? (
                                    <CircularProgress size={16} />
                                  ) : (
                                    <Icon icon="mdi:check" width={18} color={theme.palette.success.main} />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Cancel" arrow>
                              <span>
                                <IconButton size="small" onClick={handleEditCancel} disabled={isSaving}>
                                  <Icon icon="mdi:close" width={18} color={theme.palette.error.main} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Box>
                        ) : (
                          <Tooltip title="Edit" arrow>
                            <IconButton size="small" onClick={() => handleEditStart(variant, index)}>
                              <Icon icon="mdi:pencil-outline" width={18} color={theme.palette.primary.main} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={canEdit ? 6 : 5} align="center">
                  <Box className="py-4">
                    <Typography variant="body2" color="textSecondary">
                      No variants found
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ProductVariantsTable;
