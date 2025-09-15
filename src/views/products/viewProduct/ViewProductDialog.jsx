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
  Skeleton,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useTheme } from '@mui/material/styles';
import moment from 'moment';
import { taxTypes, formIcons } from '@/data/dataSets';
import { getProductById } from '@/app/(dashboard)/products/actions';

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

          ]);
          setProduct(productData);

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

 



  if (!open) return null;

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleClose}
      maxWidth='md'
      scroll='body'
      sx={{ '& .MuiDialog-container': { alignItems: 'flex-start' } }}
      PaperProps={{ 
        sx: { 
          mt: { xs: 4, sm: 6 }, 
          width: '100%',
          minWidth: { xs: '90vw', sm: '600px', md: '800px' },
          minHeight: { xs: '70vh', sm: '600px' }
        } 
      }}
    >
      <DialogTitle
        variant='h4'
        className='flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-8 sm:pbe-0 sm:pli-16'
      >
        View Product
      </DialogTitle>

      <DialogContent className='overflow-visible pbs-0 pbe-6 pli-0' sx={{ p: 0 }}>
        <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
          <i className='ri-close-line text-textSecondary' />
        </IconButton>

        {loading ? (
          <Box className="p-6">
            {/* Image Skeleton */}
            <Box className="flex justify-center mb-6">
              <Skeleton 
                variant="rectangular" 
                sx={{ 
                  width: '200px',
                  height: '200px',
                  borderRadius: 2 
                }} 
              />
            </Box>

            {/* Form Skeleton */}
            <Grid container spacing={4}>
              {/* Product Name */}
              <Grid size={{xs:12, sm:12, md:4}}>
                <Skeleton variant="rounded" height={56} />
              </Grid>

              {/* Product Type */}
              <Grid size={{xs:12, sm:6, md:4}}>
                <Skeleton variant="rounded" height={56} />
              </Grid>

              {/* Category */}
              <Grid size={{xs:12, sm:6, md:4}}>
                <Skeleton variant="rounded" height={56} />
              </Grid>

              {/* Unit */}
              <Grid size={{xs:12, sm:6, md:4}}>
                <Skeleton variant="rounded" height={56} />
              </Grid>

              {/* Purchase Price */}
              <Grid size={{xs:12, sm:6, md:4}}>
                <Skeleton variant="rounded" height={56} />
              </Grid>

              {/* Selling Price */}
              <Grid size={{xs:12, sm:6, md:4}}>
                <Skeleton variant="rounded" height={56} />
              </Grid>

              {/* Discount Value */}
              <Grid size={{xs:12, sm:6, md:4}}>
                <Skeleton variant="rounded" height={56} />
              </Grid>

              {/* Discount Type */}
              <Grid size={{xs:12, sm:6, md:4}}>
                <Skeleton variant="rounded" height={56} />
              </Grid>

              {/* Tax */}
              <Grid size={{xs:12, sm:6, md:4}}>
                <Skeleton variant="rounded" height={56} />
              </Grid>

              {/* Alert Quantity */}
              <Grid size={{xs:12, sm:6, md:4}}>
                <Skeleton variant="rounded" height={56} />
              </Grid>

              {/* SKU */}
              <Grid size={{xs:12, sm:6, md:4}}>
                <Skeleton variant="rounded" height={56} />
              </Grid>

              {/* Barcode */}
              <Grid size={{xs:12, sm:6, md:4}}>
                <Skeleton variant="rounded" height={56} />
              </Grid>
            </Grid>
          </Box>
        ) : product ? (
          <Box className="p-6">
            {/* Product Image */}
            {product.images && product.images[0] && (
              <Box className="flex justify-center mb-6">
                <Box
                  sx={{
                    width: { xs: '280px', sm: '320px', md: '350px' },
                    height: '200px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'grey.50',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden'
                  }}
                >
                  <img
                    src={product.images}
                    alt={product.name || 'Product'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      objectPosition: 'center'
                    }}
                  />
                </Box>
              </Box>
            )}

            <Grid container spacing={4}>

              {/* Product Name */}
              <Grid size={{xs:12, sm:12, md:4}}>
                <TextField
                  fullWidth
                  label="Product Name"
                  value={product.name || ''}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (

                        <Icon
                        style={{ marginRight: '5px' }}
                          icon={'mdi:alphabetical-variant'}
                          width={25}
                          color={theme.palette.secondary.light} 
                        />
       
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>

              {/* Product Type */}
              <Grid size={{xs:12, sm:6, md:4}}>
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

              {/* Category */}
              <Grid size={{xs:12, sm:6, md:4}}>
                <TextField
                  fullWidth
                  label="Type"
                  value={product.type}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                        <Icon 
                        style={{ marginRight: '5px' }}
                          icon={ formIcons.find(icon => icon.value === product.type)?.icon || ''}
                          width={25}
                          color={theme.palette.secondary.light}
                        />
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>

              {/* Unit */}
              <Grid size={{xs:12, sm:6, md:4}}>
                <TextField
                  fullWidth
                  label="Category"
                  value={product.category.name || 'N/A'}
                  InputProps={{
                    readOnly: true,
                    
                    startAdornment: (
                    
                        <Icon
                        style={{ marginRight: '5px' }}
                        icon={ formIcons.find(icon => icon.value === 'category')?.icon || ''}
                        width={25}
                        color={theme.palette.secondary.light} />
                 
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>

              {/* Purchase Price */}
              <Grid size={{xs:12, sm:6, md:4}}>
                <TextField
                  fullWidth
                  label="Unit"
                  value={product.units.name || 'N/A'}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (

                        <Icon
                        style={{ marginRight: '5px' }}
                        icon={ formIcons.find(icon => icon.value === 'unit')?.icon || ''}
                        width={25}
                        color={theme.palette.secondary.light} />
 
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>

              {/* Selling Price */}
              <Grid size={{xs:12, sm:6, md:4}}>
                <TextField
                  fullWidth
                  label="Selling Price"
                  value={product.sellingPrice || '0'}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (

                        <Icon
                        style={{ marginRight: '5px' }}
                        icon={ formIcons.find(icon => icon.value === 'currency')?.icon || ''}
                        width={23}
                        color={theme.palette.secondary.light} />

                    ),
                  }}
                  variant="outlined"
             
                />
              </Grid>

              {/* Discount Value */}
              <Grid size={{xs:12, sm:6, md:4}}>
                <TextField
                  fullWidth
                  label="Discount Value"
                  value={product.discountValue || '0'}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <Icon
                        style={{ marginRight: '5px' }}
                        icon={formIcons.find(icon => icon.value === product.discountType)?.icon || ''}
                        width={21}
                        color={theme.palette.secondary.light}
                      />
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>

              {/* Discount Type */}
              <Grid size={{xs:12, sm:6, md:4}}>
                <TextField
                  fullWidth
                  label="Discount Type"
                  value={product.discountType || 'None'}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <Icon
                        style={{ marginRight: '5px' }}
                        icon={formIcons.find(icon => icon.value === product.discountType)?.icon || ''}
                        width={21}
                        color={theme.palette.secondary.light}
                      />
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>

              {/* Tax */}
              <Grid size={{xs:12, sm:6, md:4}}>
                <TextField
                  fullWidth
                  label="Tax"
                  value={product.tax.name ? `${product.tax.name} (${product.tax.taxRate}%)` : 'N/A'}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <Icon
                        style={{ marginRight: '5px' }}
                        icon={formIcons.find(icon => icon.value === 'vat')?.icon || ''}
                        width={25}
                        color={theme.palette.secondary.light}
                      />
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>

              {/* Alert Quantity */}
              <Grid size={{xs:12, sm:6, md:4}}>
                <TextField
                  fullWidth
                  label="Alert Quantity"
                  value={product.alertQuantity || '0'}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <Icon
                        style={{ marginRight: '5px' }}
                        icon={ formIcons.find(icon => icon.value === 'alertQuantity')?.icon || ''}
                        width={23}
                        color={theme.palette.secondary.light}
                      />
                    ),
                  }}
                  variant="outlined"
                  sx={product.alertQuantity <= 10 ? {
                    '& .MuiInputBase-input': {
                      color: 'error.main',
                    }
                  } : {}}
                />
              </Grid>
                
              {/* SKU */}
              <Grid size={{xs:12, sm:6, md:4}}>
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

              {/* Barcode */}
              <Grid size={{xs:12, sm:6, md:4}}>
                <TextField
                  fullWidth
                  label="Barcode"
                  value={product.barcode || 'N/A'}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <Icon
                        style={{ marginRight: '5px' }}
                        icon={ formIcons.find(icon => icon.value === 'barcode')?.icon || ''}
                        width={23}
                        color={theme.palette.secondary.light}
                      />
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
            <Typography color="error">Product not found</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions className='flex justify-center pbs-0 pbe-10 pli-10 sm:pbe-12 sm:pli-16'>
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