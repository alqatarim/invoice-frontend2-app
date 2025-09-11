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
            {product.images && product.images[0] && (
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
                  <img
                    src={product.images}
                    alt={product.name || 'Product'}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </Box>
              </Box>
            )}

            <Grid container spacing={4}>
              {/* Product Name */}
              <Grid size={{xs:12, md:6}}>
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

              {/* Category */}
              <Grid size={{xs:12, md:6}}>
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

              {/* Unit */}
              <Grid size={{xs:12, md:6}}>
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
              <Grid size={{xs:12, md:6}}>
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

              {/* Purchase Price */}
              <Grid size={{xs:12, md:6}}>
                <TextField
                  fullWidth
                  label="Purchase Price"
                  value={product.purchasePrice || '0'}
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

              {/* Alert Quantity */}
              <Grid size={{xs:12, md:6}}>
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
                        width={25}
                        color={theme.palette.secondary.light} />

                    ),
                  }}
                  variant="outlined"
                  sx={product.alertQuantity <= 10 ? {
                    '& .MuiInputBase-input': {
                      color: 'error.main',
                      // fontWeight: 'medium'
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
                    startAdornment: (

                        <Icon
                        style={{ marginRight: '5px' }}
                        icon={ formIcons.find(icon => icon.value === 'barcode')?.icon || ''}
                        width={25}
                        color={theme.palette.secondary.light} />

                    ),
                  }}
                  variant="outlined"
                />
              </Grid>

              {/* Discount */}
                  <Grid size={{xs:12, md:6}}>
                    <TextField
                      fullWidth
                      label="Discount"
                      value={product.discountValue || '0'}
                      InputProps={{
                        readOnly: true,
                        startAdornment: (
                          <Icon
                            style={{ marginRight: '5px' }}
                            icon={formIcons.find(icon => icon.value === product.discountType)?.icon || ''}
                            width={25}
                            color={theme.palette.secondary.light}
                          />
                        ),
                      }}
                      variant="outlined"
                    />
                  </Grid>
            
       

              {/* Tax */}
              <Grid size={{xs:12, md:6}}>
                <TextField
                  fullWidth
                  label="Tax"
                  value={product.tax.taxRate || 'N/A'}
                  InputProps={{
                    readOnly: true,
             
                    startAdornment: (
                    product.tax.type && (
                          <Icon
                          style={{ marginRight: '5px' }}
                          width={22}
                            icon={taxTypes.find(t => t.value === String(product.tax.type))?.icon || ''}
                            color={theme.palette.secondary.light}
                          />
                        )
     
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