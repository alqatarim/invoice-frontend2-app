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
  Avatar,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { getProductById, getDropdownData } from '@/app/(dashboard)/products/actions';
import { formIcons, taxTypes } from '@/data/dataSets';
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
    imagePreview,
    selectedFile,
    imageError,
    handleImageChange,
    handleImageError,
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
  const watchType = watch('type');

  // Helper function to get icon for the current type
  const getTypeIcon = (typeValue) => {
    const iconData = formIcons.find(icon => icon.value === typeValue);
    return iconData ? iconData.icon : null;
  };


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
        Edit Product
      </DialogTitle>

      <DialogContent className='overflow-visible pbs-0 pbe-6 pli-0' sx={{ p: 0 }}>
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
                // Trigger refetch
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
          <Box className="p-6">
            {/* Current Product Image */}
            {imagePreview && (
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
                    src={imagePreview}
                    alt={productData?.name || 'Product'}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                    onError={handleImageError}
                  />
                </Box>
              </Box>
            )}

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
                        <Select 
                          {...field} 
                          label="Type" 
                          disabled={isSubmitting}
                          startAdornment={
                            watchType && getTypeIcon(watchType) && (
                      
                                <Icon
                                style={{ marginRight: '5px' }}
                                icon={getTypeIcon(watchType)}
                                width={25}
                                color={theme.palette.secondary.light}
                              />
                             
                            )
                          }
                        >
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
                        InputProps={{
                          startAdornment: ( 
                       

                              <Icon
                              style={{ marginRight: '5px' }}
                                icon={'mdi:alphabetical-variant'}
                                width={23}
                                color={theme.palette.secondary.light}
                              />
                          ),
                      
                        }}
                        variant="outlined"
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
                        variant="outlined"
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
                        <Select {...field} label="Category" disabled={isSubmitting || loading}
                            startAdornment={
                          
                              <Icon
                              style={{ marginRight: '5px' }}
                                icon={formIcons.find(icon => icon.value === 'category')?.icon || 'mdi:ruler'}
                                width={23}
                                color={theme.palette.secondary.light}
                              />
                        
                          }
                        
                        >
                          {dropdownData.categories && Array.isArray(dropdownData.categories) && dropdownData.categories.length > 0 ? (
                            dropdownData.categories.map((category) => (
                              <MenuItem key={category._id} value={category._id}>
                                {category.name}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>No categories available</MenuItem>
                          )}
                        </Select>
                        {errors.category && <FormHelperText>{errors.category.message}</FormHelperText>}
                      </FormControl>
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
                        <Select 
                          {...field} 
                          label="Unit" 
                          disabled={isSubmitting || loading}
                          startAdornment={
                          
                              <Icon
                              style={{ marginRight: '5px' }}
                                icon={formIcons.find(icon => icon.value === 'unit')?.icon || 'mdi:ruler'}
                                width={25}
                                color={theme.palette.secondary.light}
                              />
                        
                          }
                        >
                          {dropdownData.units && Array.isArray(dropdownData.units) && dropdownData.units.length > 0 ? (
                            dropdownData.units.map((unit) => (
                              <MenuItem key={unit._id} value={unit._id}>
                                {unit.name}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>No units available</MenuItem>
                          )}
                        </Select>
                        {errors.units && <FormHelperText>{errors.units.message}</FormHelperText>}
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
                            
                              <Icon
                               style={{ marginRight: '5px' }}
                                icon={formIcons.find(icon => icon.value === 'currency')?.icon || 'lucide:saudi-riyal'}
                                width={21}
                                color={theme.palette.secondary.light}
                              />
                          
                          ),
                        }}
                        variant="outlined"
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
                            
                              <Icon
                               style={{ marginRight: '5px' }}
                                icon={formIcons.find(icon => icon.value === 'currency')?.icon || 'lucide:saudi-riyal'}
                                width={21}
                                color={theme.palette.secondary.light}
                              />
                            
                          ),
                        }}
                        variant="outlined"
                      />
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
                        defaultValue={0}
                        error={!!errors.discountValue}
                        helperText={errors.discountValue?.message}
                        disabled={isSubmitting}
                        InputProps={{
                          startAdornment: (
                         
                              
                              <Icon
                              style={{ marginRight: '5px' }}
                                icon={formIcons.find(icon => icon.value === watchDiscountType)?.icon || ''}
                                width={21}
                                color={theme.palette.secondary.light}
                              />
                          )
                     
                     
                      
                    }}
                    variant="outlined"
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
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                
                                <Icon
                                style={{ marginRight: '5px' }}
                                  icon={formIcons.find(icon => icon.value === type.value)?.icon || ''}
                                  width={21}
                                  color={theme.palette.secondary.light}
                                />
                                {type.label}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
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
                        InputProps={{
                          startAdornment: (
                         
                              
                              <Icon
                              style={{ marginRight: '5px' }}
                                icon={formIcons.find(icon => icon.value === 'alertQuantity')?.icon || 'mdi:alert-circle-outline'}
                                width={23}
                                color={theme.palette.secondary.light}
                              />
                          ),
                        }}
                        variant="outlined"
                        sx={field.value <= 10 ? {
                          '& .MuiInputBase-input': {
                            color: 'error.main',
                          }
                        } : {}}
                      />
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
                        InputProps={{
                          startAdornment: (
                          
                              
                              <Icon
                              style={{ marginRight: '5px' }}
                                icon={formIcons.find(icon => icon.value === 'barcode')?.icon || 'mdi:barcode'}
                                width={23}
                                color={theme.palette.secondary.light}
                              />
                         
                          ),
                        }}
                        variant="outlined"
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
                        <Select {...field} label="Tax" disabled={isSubmitting || loading}
                        
                        startAdornment={
                          
                          <Icon
                          style={{ marginRight: '5px' }}
                            icon={formIcons.find(icon => icon.value === 'vat')?.icon || ''}
                            width={25}
                            color={theme.palette.secondary.light}
                          />
                    
                      }
                        >

                          {dropdownData.taxes && Array.isArray(dropdownData.taxes) && dropdownData.taxes.length > 0 ? (
                            dropdownData.taxes.map((tax) => (
                              
                             
                              <MenuItem key={tax._id} value={tax._id}>
                           
                               
                                  {tax.name} ({tax.taxRate}%)
                            
                              </MenuItem>
                           
                            ))
                          ) : null}
                          
                        </Select>
                      
                        {errors.tax && <FormHelperText>{errors.tax.message}</FormHelperText>}
                      </FormControl>
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
                        rows={3}
                        label="Description"
                        placeholder="Enter product description"
                        error={!!errors.productDescription}
                        helperText={errors.productDescription?.message}
                        disabled={isSubmitting}
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>

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
                          sx={{ mb: 2 }}
                        >
                          Upload New Image
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => {
                              handleImageChange(e);
                              const file = e.target.files[0];
                              if (file) {
                                onChange(file);
                              }
                            }}
                          />
                        </Button>
                        {imageError && (
                          <Typography variant="caption" color="error" className='block mt-2'>
                            {imageError}
                          </Typography>
                        )}
                        {selectedFile && (
                          <Typography variant="caption" color="success.main" className='block mt-2'>
                            New image selected: {selectedFile.name}
                          </Typography>
                        )}
                      </Box>
                    )}
                  />
                </Grid>

                {/* Status */}
                <Grid size={{xs:12}}>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch {...field} checked={field.value} />}
                        label="Active Status"
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </form>
          </Box>
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