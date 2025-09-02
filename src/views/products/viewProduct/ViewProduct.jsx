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
  Avatar,
  Divider,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useTheme } from '@mui/material/styles';
import { getProductById, getDropdownData } from '@/app/(dashboard)/products/actions';

const ViewProductDialog = ({ open, productId, onClose, onEdit, onError, onSuccess }) => {
  const theme = useTheme();
  const [product, setProduct] = useState(null);
  const [dropdownData, setDropdownData] = useState({ units: [], categories: [], taxes: [] });
  const [loading, setLoading] = useState(false);

  // Fetch product data when dialog opens
  useEffect(() => {
    const fetchProduct = async () => {
      if (open && productId) {
        setLoading(true);
        try {
          const [productData, dropdown] = await Promise.all([
            getProductById(productId),
            getDropdownData()
          ]);
          setProduct(productData);
          if (dropdown.success) {
            setDropdownData(dropdown.data);
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
    onClose();
  };

  const handleEditProduct = () => {
    if (product?._id && onEdit) {
      onEdit(product._id);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = dropdownData.categories.find(cat => cat._id === categoryId);
    return category?.category_name || 'N/A';
  };

  const getUnitName = (unitId) => {
    const unit = dropdownData.units.find(u => u._id === unitId);
    return unit?.unit || 'N/A';
  };

  const getTaxName = (taxId) => {
    if (!taxId) return 'No Tax';
    const tax = dropdownData.taxes.find(t => t._id === taxId);
    return tax ? `${tax.name} (${tax.tax_percentage}%)` : 'N/A';
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

      <DialogContent className='overflow-visible pbs-0 pbe-6 pli-12 sm:pli-12'>
        <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
          <i className='ri-close-line text-textSecondary' />
        </IconButton>

        {loading ? (
          <Box className="flex justify-center items-center h-40">
            <CircularProgress />
            <Typography className="ml-3">Loading product details...</Typography>
          </Box>
        ) : product ? (
          <Box>
            {/* Product Image */}
            {product.images && product.images[0] && (
              <Box className="flex justify-center mb-6">
                <Avatar
                  src={product.images[0]}
                  variant="rounded"
                  sx={{ width: 150, height: 150 }}
                />
              </Box>
            )}

            <Grid container spacing={4}>
              {/* Product Name */}
              <Grid size={{xs:12, md:6}}>
                <Typography variant="caption" color="text.secondary">
                  Product Name
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {product.name || 'N/A'}
                </Typography>
              </Grid>

              {/* SKU */}
              <Grid size={{xs:12, md:6}}>
                <Typography variant="caption" color="text.secondary">
                  SKU
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {product.sku || 'N/A'}
                </Typography>
              </Grid>

              {/* Category */}
              <Grid size={{xs:12, md:6}}>
                <Typography variant="caption" color="text.secondary">
                  Category
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {getCategoryName(product.category?._id || product.category)}
                </Typography>
              </Grid>

              {/* Unit */}
              <Grid size={{xs:12, md:6}}>
                <Typography variant="caption" color="text.secondary">
                  Unit
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {getUnitName(product.units?._id || product.units)}
                </Typography>
              </Grid>

              {/* Selling Price */}
              <Grid size={{xs:12, md:6}}>
                <Typography variant="caption" color="text.secondary">
                  Selling Price
                </Typography>
                <Box className="flex items-center gap-1">
                  <Icon icon="lucide:saudi-riyal" width="1rem" color={theme.palette.secondary.light} />
                  <Typography variant="body1" className="font-medium">
                    {Number(product.sellingPrice || 0).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </Typography>
                </Box>
              </Grid>

              {/* Purchase Price */}
              <Grid size={{xs:12, md:6}}>
                <Typography variant="caption" color="text.secondary">
                  Purchase Price
                </Typography>
                <Box className="flex items-center gap-1">
                  <Icon icon="lucide:saudi-riyal" width="1rem" color={theme.palette.secondary.light} />
                  <Typography variant="body1" className="font-medium">
                    {Number(product.purchasePrice || 0).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </Typography>
                </Box>
              </Grid>

              {/* Alert Quantity */}
              <Grid size={{xs:12, md:6}}>
                <Typography variant="caption" color="text.secondary">
                  Alert Quantity
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {product.alertQuantity || '0'}
                </Typography>
              </Grid>

              {/* Barcode */}
              <Grid size={{xs:12, md:6}}>
                <Typography variant="caption" color="text.secondary">
                  Barcode
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {product.barcode || 'N/A'}
                </Typography>
              </Grid>

              {/* Tax */}
              <Grid size={{xs:12, md:6}}>
                <Typography variant="caption" color="text.secondary">
                  Tax
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {getTaxName(product.tax?._id || product.tax)}
                </Typography>
              </Grid>

              {/* Status */}
              <Grid size={{xs:12, md:6}}>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Box className="mt-1">
                  <Chip
                    size='small'
                    variant='tonal'
                    label={product.isDeleted ? 'Inactive' : 'Active'}
                    color={product.isDeleted ? 'error' : 'success'}
                  />
                </Box>
              </Grid>

              {/* Discount */}
              {(product.discountValue > 0) && (
                <Grid size={{xs:12, md:6}}>
                  <Typography variant="caption" color="text.secondary">
                    Discount
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {product.discountValue}{product.discountType === 'Percentage' ? '%' : ' SAR'}
                  </Typography>
                </Grid>
              )}

              {/* Description */}
              {product.productDescription && (
                <Grid size={{xs:12}}>
                  <Divider className="my-2" />
                  <Typography variant="caption" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1" className="mt-1">
                    {product.productDescription}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        ) : (
          <Box className="flex justify-center items-center h-40">
            <Typography color="error">Product not found</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions className='gap-2 justify-center pbs-0 pbe-10 pli-10 sm:pbe-16 sm:pli-16'>
        <Button variant='outlined' color='secondary' onClick={handleClose}>
          Close
        </Button>
        {product && !product.isDeleted && (
          <Button variant='contained' onClick={handleEditProduct} startIcon={<Icon icon="mdi:edit" />}>
            Edit Product
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ViewProductDialog;