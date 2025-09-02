import React, { useEffect, useState } from 'react';
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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  IconButton,
  CircularProgress,
  Avatar,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { getProductById, getDropdownData } from '@/app/(dashboard)/products/actions';
import { useEditProductHandlers } from '@/handlers/products/editProduct';

const EditProductDialog = ({ open, productId, onClose, onSave }) => {
  const theme = useTheme();
  const [productData, setProductData] = useState(null);
  const [dropdownData, setDropdownData] = useState({ units: [], categories: [], taxes: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    control,
    handleSubmit,
    watch,
    errors,
    productTypes,
    discountTypes,
    isSubmitting,
    handleFormSubmit,
    reset,
  } = useEditProductHandlers({
    productData: productData || null,
    dropdownData,
    onSave: async (data, preparedImage) => {
      const result = await onSave(productId, data, preparedImage);
      if (result.success) {
        onClose();
      }
      return result;
    },
  });

  const watchDiscountType = watch('discountType');

  // Fetch product and dropdown data when dialog opens
  useEffect(() => {
    const fetchData = async () => {
      if (open && productId) {
        setLoading(true);
        setError(null);
        try {
          const [productResponse, dropdownResponse] = await Promise.all([
            getProductById(productId),
            getDropdownData()
          ]);
          
          if (productResponse && typeof productResponse === 'object') {
            setProductData(productResponse);
          } else {
            throw new Error('Invalid product data received');
          }
          
          if (dropdownResponse.success) {
            setDropdownData(dropdownResponse.data);
          }
        } catch (error) {
          console.error('Failed to fetch data:', error);
          setError(error.message || 'Failed to load product data');
          setProductData(null);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [open, productId]);

  const handleClose = () => {
    setProductData(null);
    setError(null);
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
        ) : error ? (
          <Box className="flex flex-col justify-center items-center h-40 gap-4">
            <Typography color="error" variant="h6">Error Loading Product</Typography>
            <Typography color="error">{error}</Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => {
                setError(null);
                // Trigger refetch by changing the dependency
                const fetchData = async () => {
                  if (open && productId) {
                    setLoading(true);
                    setError(null);
                    try {
                      const [productResponse, dropdownResponse] = await Promise.all([
                        getProductById(productId),
                        getDropdownData()
                      ]);
                      
                      if (productResponse && typeof productResponse === 'object') {
                        setProductData(productResponse);
                      } else {
                        throw new Error('Invalid product data received');
                      }
                      
                      if (dropdownResponse.success) {
                        setDropdownData(dropdownResponse.data);
                      }
                    } catch (error) {
                      console.error('Failed to fetch data:', error);
                      setError(error.message || 'Failed to load product data');
                      setProductData(null);
                    } finally {
                      setLoading(false);
                    }
                  }
                };
                fetchData();
              }}
            >
              Retry
            </Button>
          </Box>
        ) : productData ? (
          <form onSubmit={handleSubmit(handleFormSubmit)} id="edit-product-form">
            <Grid container spacing={4}>
              {/* Product Type */}
              <Grid size={{xs:12, md:6}}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.type}>
                      <InputLabel>Type</InputLabel>
                      <Select {...field} label="Type" disabled={isSubmitting}>
                        {productTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Product Name */}
              <Grid size={{xs:12, md:6}}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Product Name"
                      placeholder="Enter product name"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      disabled={isSubmitting}
                      required
                    />
                  )}
                />
              </Grid>

              {/* SKU */}
              <Grid size={{xs:12, md:6}}>
                <Controller
                  name="sku"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="SKU"
                      placeholder="Enter SKU"
                      error={!!errors.sku}
                      helperText={errors.sku?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Grid>

              {/* Category */}
              <Grid size={{xs:12, md:6}}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.category} required>
                      <InputLabel>Category</InputLabel>
                      <Select {...field} label="Category" disabled={isSubmitting}>
                        {dropdownData.categories && dropdownData.categories.map((category) => (
                          <MenuItem key={category._id} value={category._id}>
                            {category.category_name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.category && <FormHelperText>{errors.category.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Selling Price */}
              <Grid size={{xs:12, md:6}}>
                <Controller
                  name="sellingPrice"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Selling Price"
                      placeholder="0.00"
                      error={!!errors.sellingPrice}
                      helperText={errors.sellingPrice?.message}
                      disabled={isSubmitting}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Icon icon="lucide:saudi-riyal" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Purchase Price */}
              <Grid size={{xs:12, md:6}}>
                <Controller
                  name="purchasePrice"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Purchase Price"
                      placeholder="0.00"
                      error={!!errors.purchasePrice}
                      helperText={errors.purchasePrice?.message}
                      disabled={isSubmitting}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Icon icon="lucide:saudi-riyal" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Unit */}
              <Grid size={{xs:12, md:6}}>
                <Controller
                  name="units"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.units} required>
                      <InputLabel>Unit</InputLabel>
                      <Select {...field} label="Unit" disabled={isSubmitting}>
                        {dropdownData.units && dropdownData.units.map((unit) => (
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

              {/* Alert Quantity */}
              <Grid size={{xs:12, md:6}}>
                <Controller
                  name="alertQuantity"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Alert Quantity"
                      placeholder="0"
                      error={!!errors.alertQuantity}
                      helperText={errors.alertQuantity?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Grid>

              {/* Tax */}
              <Grid size={{xs:12, md:6}}>
                <Controller
                  name="tax"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.tax}>
                      <InputLabel>Tax</InputLabel>
                      <Select {...field} label="Tax" disabled={isSubmitting}>
                        <MenuItem value="">None</MenuItem>
                        {dropdownData.taxes && dropdownData.taxes.map((tax) => (
                          <MenuItem key={tax._id} value={tax._id}>
                            {tax.name} ({tax.tax_percentage}%)
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.tax && <FormHelperText>{errors.tax.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Barcode */}
              <Grid size={{xs:12, md:6}}>
                <Controller
                  name="barcode"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Barcode"
                      placeholder="Enter barcode"
                      error={!!errors.barcode}
                      helperText={errors.barcode?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Grid>

              {/* Discount Type */}
              <Grid size={{xs:12, md:6}}>
                <Controller
                  name="discountType"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Discount Type</InputLabel>
                      <Select {...field} label="Discount Type" disabled={isSubmitting}>
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

              {/* Discount Value */}
              <Grid size={{xs:12, md:6}}>
                <Controller
                  name="discountValue"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Discount Value"
                      placeholder="0"
                      error={!!errors.discountValue}
                      helperText={errors.discountValue?.message}
                      disabled={isSubmitting}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Icon icon={watchDiscountType === 'Percentage' ? 'mdi:percent' : 'lucide:saudi-riyal'} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Description */}
              <Grid size={{xs:12}}>
                <Controller
                  name="productDescription"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={4}
                      label="Description"
                      placeholder="Enter product description"
                      error={!!errors.productDescription}
                      helperText={errors.productDescription?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Grid>

              {/* Current Image Display */}
              {productData.images && productData.images[0] && (
                <Grid size={{xs:12}}>
                  <Typography variant="body2" className="mb-2">Current Image:</Typography>
                  <Avatar
                    src={productData.images[0]}
                    variant="rounded"
                    sx={{ width: 100, height: 100 }}
                  />
                </Grid>
              )}

              {/* Image Upload */}
              <Grid size={{xs:12}}>
                <Controller
                  name="images"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Box>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<Icon icon="mdi:upload" />}
                        disabled={isSubmitting}
                      >
                        Upload New Image
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              onChange(file);
                            }
                          }}
                        />
                      </Button>
                    </Box>
                  )}
                />
              </Grid>
            </Grid>
          </form>
        ) : (
          <Box className="flex justify-center items-center h-40">
            <Typography color="error">Failed to load product data</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions className='gap-2 justify-center pbs-0 pbe-10 pli-10 sm:pbe-16 sm:pli-16'>
        <Button
          variant='outlined'
          color='secondary'
          onClick={handleClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="edit-product-form"
          variant='contained'
          disabled={isSubmitting || loading || !productData}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'Updating...' : 'Update Product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProductDialog;