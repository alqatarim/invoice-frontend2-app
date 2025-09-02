import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
  Button,
  Grid,
  Box,
  IconButton,
  CircularProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useTheme } from '@mui/material/styles';
import moment from 'moment';

import { getProductDetails, getDropdownData } from '@/app/(dashboard)/products/actions';

const ViewProductDialog = ({ open, productId, onClose, onEdit, onError, onSuccess }) => {
  const theme = useTheme();
  const [product, setProduct] = useState(null);
  const [dropdownData, setDropdownData] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch product data when dialog opens
  useEffect(() => {
    const fetchProduct = async () => {
      if (open && productId) {
        setLoading(true);
        try {
          const [productResponse, dropdownResponse] = await Promise.all([
            getProductDetails(productId),
            getDropdownData()
          ]);
          
          if (productResponse.success) {
            setProduct(productResponse.data);
            setDropdownData(dropdownResponse.data || {});
          } else {
            throw new Error(productResponse.error || 'Failed to fetch product');
          }
        } catch (error) {
          onError?.(error.message || 'Failed to fetch product data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProduct();
  }, [open, productId, onError]);

  const handleClose = () => {
    setProduct(null);
    setDropdownData({});
    onClose();
  };

  const handleEditProduct = () => {
    if (product?._id && onEdit) {
      onEdit(product._id);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = dropdownData.category?.find(cat => cat._id === categoryId);
    return category?.category_name || 'N/A';
  };

  const getUnitName = (unitId) => {
    const unit = dropdownData.unit_types?.find(u => u._id === unitId);
    return unit?.unit || 'N/A';
  };

  const getTaxName = (taxId) => {
    const tax = dropdownData.tax?.find(t => t._id === taxId);
    return tax ? `${tax.name} (${tax.taxRate}%)` : 'N/A';
  };

  if (!open) return null;

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleClose}
      maxWidth='md'
      scroll='body'
      sx={{ '& .MuiDialog-container': { alignItems: 'flex-start' } }}
      PaperProps={{ sx: { mt: { xs: 4, sm: 6 }, width: '100%' } }}
    >
      <DialogTitle
        variant='h4'
        className='flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16'
      >
        View Product
      </DialogTitle>

      <DialogContent className='overflow-visible pbs-0 pbe-6 pli-0' sx={{ p: 0 }}>
        <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
          <i className='ri-close-line text-textSecondary' />
        </IconButton>

        {loading ? (
          <Box className="flex justify-center items-center h-40">
            <CircularProgress />
            <Typography className="ml-3">Loading product details...</Typography>
          </Box>
        ) : product ? (
          <Box className="p-6">
            {/* Product Image */}
            <Box className="flex justify-center mb-6">
              <Box
                sx={{
                  width: 150,
                  height: 150,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'background.default',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                {product.images ? (
                  <img
                    src={product.images}
                    alt={product.name || 'Product'}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />
                ) : (
                  <Icon icon="mdi:image-outline" fontSize={60} color={theme?.palette?.text?.disabled} />
                )}
              </Box>
            </Box>

            <Grid container spacing={4}>
              {/* Product Name */}
              <Grid size={{xs:12, md:6}}>
                <TextField
                  fullWidth
                  label="Product Name"
                  value={product.name || ''}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
                />
              </Grid>

              {/* SKU */}
              <Grid size={{xs:12, md:6}}>
                <TextField
                  fullWidth
                  label="SKU"
                  value={product.sku || ''}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
                />
              </Grid>

              {/* Product Type */}
              <Grid size={{xs:12, md:6}}>
                <TextField
                  fullWidth
                  label="Type"
                  value={product.type === 'service' ? 'Service' : 'Product'}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <Chip
                          label={product.type === 'service' ? 'Service' : 'Product'}
                          color={product.type === 'service' ? 'secondary' : 'primary'}
                          size="small"
                        />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>

              {/* Category */}
              <Grid size={{xs:12, md:6}}>
                <TextField
                  fullWidth
                  label="Category"
                  value={getCategoryName(product.category)}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
                />
              </Grid>

              {/* Unit */}
              <Grid size={{xs:12, md:6}}>
                <TextField
                  fullWidth
                  label="Unit"
                  value={getUnitName(product.units)}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
                />
              </Grid>

              {/* Selling Price */}
              <Grid size={{xs:12, md:6}}>
                <TextField
                  fullWidth
                  label="Selling Price"
                  value={product.sellingPrice || '0'}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon icon='lucide:saudi-riyal' color={theme.palette.secondary.light} />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  sx={{
                    '& .MuiInputBase-input': {
                      color: 'success.dark',
                      fontWeight: 'medium'
                    }
                  }}
                />
              </Grid>

              {/* Purchase Price */}
              <Grid size={{xs:12, md:6}}>
                <TextField
                  fullWidth
                  label="Purchase Price"
                  value={product.purchasePrice || '0'}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon icon='lucide:saudi-riyal' color={theme.palette.secondary.light} />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>

              {/* Alert Quantity */}
              <Grid size={{xs:12, md:6}}>
                <TextField
                  fullWidth
                  label="Alert Quantity"
                  value={product.alertQuantity || '0'}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
                  sx={product.alertQuantity <= 10 ? {
                    '& .MuiInputBase-input': {
                      color: 'error.main',
                      fontWeight: 'medium'
                    }
                  } : {}}
                />
              </Grid>

              {/* Barcode */}
              <Grid size={{xs:12, md:6}}>
                <TextField
                  fullWidth
                  label="Barcode"
                  value={product.barcode || 'N/A'}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
                />
              </Grid>

              {/* Discount */}
              {product.discountValue > 0 && (
                <>
                  <Grid size={{xs:12, md:6}}>
                    <TextField
                      fullWidth
                      label="Discount"
                      value={`${product.discountValue} ${product.discountType === 'Percentage' ? '%' : ' (Fixed)'}`}
                      InputProps={{
                        readOnly: true,
                      }}
                      variant="outlined"
                    />
                  </Grid>
                </>
              )}

              {/* Tax */}
              <Grid size={{xs:12, md:6}}>
                <TextField
                  fullWidth
                  label="Tax"
                  value={getTaxName(product.tax)}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
                />
              </Grid>

              {/* Created Date */}
              <Grid size={{xs:12, md:6}}>
                <TextField
                  fullWidth
                  label="Created Date"
                  value={product.createdAt ? moment(product.createdAt).format('DD MMM YYYY') : 'N/A'}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
                />
              </Grid>

              {/* Status */}
              <Grid size={{xs:12, md:6}}>
                <TextField
                  fullWidth
                  label="Status"
                  value={product.isDeleted ? 'Inactive' : 'Active'}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <Chip
                          label={product.isDeleted ? 'Inactive' : 'Active'}
                          color={product.isDeleted ? 'error' : 'success'}
                          size="small"
                        />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>

              {/* Description */}
              {product.productDescription && (
                <Grid size={{xs:12}}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={product.productDescription}
                    InputProps={{
                      readOnly: true,
                    }}
                    variant="outlined"
                    multiline
                    rows={3}
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        ) : (
          <Box className="flex justify-center items-center h-40">
            <Typography>Failed to load product details</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions className='flex justify-center pbs-0 pbe-10 pli-10 sm:pbe-16 sm:pli-16'>
        <Button color='secondary' variant='outlined' onClick={handleClose}>
          Close
        </Button>
        {product && onEdit && (
          <Button variant='contained' onClick={handleEditProduct}>
            Edit Product
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ViewProductDialog;