import React, { useEffect, useRef } from 'react';
import { Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormHelperText,
  InputAdornment,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Switch,
  Box,
  IconButton,
  CircularProgress,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { getProductDetails, getDropdownData } from '@/app/(dashboard)/products/actions';

import { useEditProductHandlers } from '@/handlers/products/editProduct';

const EditProductDialog = ({ open, productId, onClose, onSave }) => {
  const theme = useTheme();
  const [productData, setProductData] = React.useState(null);
  const [dropdownData, setDropdownData] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const {
    control,
    handleSubmit,
    watch,
    errors,
    isSubmitting,
    handleFormSubmit,
    reset,
    productTypes,
    discountTypes,
  } = useEditProductHandlers({
    productData,
    dropdownData,
    onSave: async (data) => {
      const result = await onSave(productId, data);
      if (result.success) {
        onClose();
      }
      return result;
    },
  });

  const watchDiscountValue = watch('discountValue');
  const watchType = watch('type');

  // Track fetched data to prevent unnecessary refetching
  const fetchedDataRef = useRef({ productId: null, productData: null, dropdownData: null });

  // Fetch product data when dialog opens
  useEffect(() => {
    const fetchProductData = async () => {
      if (open && productId) {
        // Check if we already have this product's data
        if (fetchedDataRef.current.productId === productId && fetchedDataRef.current.productData) {
          setProductData(fetchedDataRef.current.productData);
          setDropdownData(fetchedDataRef.current.dropdownData || {});
          return;
        }

        setLoading(true);
        try {
          const [productResponse, dropdownResponse] = await Promise.all([
            getProductDetails(productId),
            getDropdownData()
          ]);
          
          if (productResponse.success) {
            const productData = productResponse.data;
            const dropdownData = dropdownResponse.data || {};
            
            // Cache the fetched data
            fetchedDataRef.current = {
              productId,
              productData,
              dropdownData
            };
            
            setProductData(productData);
            setDropdownData(dropdownData);
          } else {
            throw new Error(productResponse.error || 'Failed to fetch product');
          }
        } catch (error) {
          console.error('Failed to fetch product data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProductData();
  }, [open, productId]);

  const handleClose = () => {
    setProductData(null);
    setDropdownData({});
    // Clear cache when dialog closes to ensure fresh data next time
    fetchedDataRef.current = { productId: null, productData: null, dropdownData: null };
    onClose();
  };

  if (!open) return null;

  return (
    <Dialog fullWidth open={open} onClose={handleClose} maxWidth='md' scroll='body'>
      <DialogTitle
        variant='h4'
        className='flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16'
      >
        Edit Product
      </DialogTitle>

      <DialogContent className='overflow-visible pbs-0 pbe-6 pli-12 sm:pli-12'>
        <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4' disabled={isSubmitting}>
          <i className='ri-close-line text-textSecondary' />
        </IconButton>

        {loading ? (
          <Box className="flex justify-center items-center h-40">
            <CircularProgress />
            <Typography className="ml-3">Loading product data...</Typography>
          </Box>
        ) : productData ? (
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <Grid container spacing={5}>
              {/* Product Type */}
              <Grid size={{xs:12}}>
                <FormLabel className='text-base font-medium mb-3 block'>Product Type</FormLabel>
                <Controller
                  name='type'
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
                      {productTypes.map((type) => (
                        <FormControlLabel
                          key={type.value}
                          value={type.value}
                          control={<Radio />}
                          label={type.label}
                        />
                      ))}
                    </RadioGroup>
                  )}
                />
                {errors.type && <FormHelperText error>{errors.type.message}</FormHelperText>}
              </Grid>

              {/* Product Name */}
              <Grid size={{xs:12, md:6}}>
                <Controller
                  name='name'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Product Name'
                      error={Boolean(errors.name)}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>

              {/* SKU */}
              <Grid size={{xs:12, md:6}}>
                <Controller
                  name='sku'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='SKU'
                      error={Boolean(errors.sku)}
                      helperText={errors.sku?.message}
                    />
                  )}
                />
              </Grid>

              {/* Category */}
              <Grid size={{xs:12, md:6}}>
                <Controller
                  name='category'
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={Boolean(errors.category)}>
                      <InputLabel>Category</InputLabel>
                      <Select {...field} label='Category'>
                        {(dropdownData.category || []).map((cat) => (
                          <MenuItem key={cat._id} value={cat._id}>
                            {cat.category_name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.category && <FormHelperText>{errors.category.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Unit */}
              <Grid size={{xs:12, md:6}}>
                <Controller
                  name='units'
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={Boolean(errors.units)}>
                      <InputLabel>Unit</InputLabel>
                      <Select {...field} label='Unit'>
                        {(dropdownData.unit_types || []).map((unit) => (
                          <MenuItem key={unit._id} value={unit._id}>
                            {unit.unit}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.units && <FormHelperText>{errors.units.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Selling Price */}
              <Grid size={{xs:12, md:6}}>
                <Controller
                  name='sellingPrice'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Selling Price'
                      type='number'
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Icon icon='lucide:saudi-riyal' />
                          </InputAdornment>
                        ),
                      }}
                      error={Boolean(errors.sellingPrice)}
                      helperText={errors.sellingPrice?.message}
                    />
                  )}
                />
              </Grid>

              {/* Purchase Price */}
              <Grid size={{xs:12, md:6}}>
                <Controller
                  name='purchasePrice'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Purchase Price'
                      type='number'
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Icon icon='lucide:saudi-riyal' />
                          </InputAdornment>
                        ),
                      }}
                      error={Boolean(errors.purchasePrice)}
                      helperText={errors.purchasePrice?.message}
                    />
                  )}
                />
              </Grid>

              {/* Discount Value */}
              <Grid size={{xs:12, md:6}}>
                <Controller
                  name='discountValue'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Discount Value'
                      type='number'
                      error={Boolean(errors.discountValue)}
                      helperText={errors.discountValue?.message}
                    />
                  )}
                />
              </Grid>

              {/* Discount Type */}
              {watchDiscountValue > 0 && (
                <Grid size={{xs:12, md:6}}>
                  <Controller
                    name='discountType'
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Discount Type</InputLabel>
                        <Select {...field} label='Discount Type'>
                          {discountTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              {type.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
              )}

              {/* Alert Quantity */}
              {watchType === 'product' && (
                <Grid size={{xs:12, md:6}}>
                  <Controller
                    name='alertQuantity'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Alert Quantity'
                        type='number'
                        error={Boolean(errors.alertQuantity)}
                        helperText={errors.alertQuantity?.message}
                      />
                    )}
                  />
                </Grid>
              )}

              {/* Barcode */}
              <Grid size={{xs:12, md:6}}>
                <Controller
                  name='barcode'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Barcode'
                      error={Boolean(errors.barcode)}
                      helperText={errors.barcode?.message}
                    />
                  )}
                />
              </Grid>

              {/* Tax */}
              <Grid size={{xs:12, md:6}}>
                <Controller
                  name='tax'
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Tax</InputLabel>
                      <Select {...field} label='Tax'>
                        <MenuItem value="">None</MenuItem>
                        {(dropdownData.tax || []).map((tax) => (
                          <MenuItem key={tax._id} value={tax._id}>
                            {tax.name} ({tax.taxRate}%)
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Description */}
              <Grid size={{xs:12}}>
                <Controller
                  name='productDescription'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Product Description'
                      multiline
                      rows={3}
                      error={Boolean(errors.productDescription)}
                      helperText={errors.productDescription?.message}
                    />
                  )}
                />
              </Grid>

              {/* Status */}
              <Grid size={{xs:12}}>
                <Controller
                  name='status'
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label='Active Status'
                    />
                  )}
                />
              </Grid>
            </Grid>
          </form>
        ) : (
          <Box className="flex justify-center items-center h-40">
            <Typography>Failed to load product data</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions className='flex justify-center pbs-0 pbe-10 pli-10 sm:pbe-16 sm:pli-16'>
        <Button color='secondary' variant='outlined' onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          variant='contained' 
          onClick={handleSubmit(handleFormSubmit)} 
          disabled={isSubmitting || !productData}
        >
          {isSubmitting ? <CircularProgress size={20} /> : 'Update Product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProductDialog;