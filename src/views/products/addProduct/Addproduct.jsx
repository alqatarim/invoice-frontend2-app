import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { getDropdownData, generateSKU } from '@/app/(dashboard)/products/actions';
import { useAddProductHandlers } from '@/handlers/products/addProduct';

const AddProductDialog = ({ open, onClose, onSave }) => {
  const theme = useTheme();
  const [dropdownData, setDropdownData] = useState({ units: [], categories: [], taxes: [] });
  const [loadingDropdown, setLoadingDropdown] = useState(false);

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
    imagePreview,
    selectedFile,
    imageError,
    handleImageChange,
    handleImageError,
    setValue,
  } = useAddProductHandlers({
    dropdownData,
    onSave: async (data) => {
      const result = await onSave(data);
      if (result.success) {
        reset();
        onClose();
      }
      return result;
    },
  });

  useEffect(() => {
    const fetchDropdownData = async () => {
      if (open) {
        setLoadingDropdown(true);
        try {
          const response = await getDropdownData();
          if (response.success) {
            setDropdownData(response.data);
          }
        } catch (error) {
          console.error('Failed to fetch dropdown data:', error);
        } finally {
          setLoadingDropdown(false);
        }
      }
    };

    fetchDropdownData();
  }, [open]);

  const handleGenerateSKU = async () => {
    try {
      const response = await generateSKU();
      if (response.success) {
        setValue('sku', response.data.sku);
      }
    } catch (error) {
      console.error('Failed to generate SKU:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const watchDiscountType = watch('discountType');

  return (
    <Dialog fullWidth open={open} onClose={handleClose} maxWidth='md' scroll='body'>
      <DialogTitle
        variant='h4'
        className='flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16'
      >
        Add New Product
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent className='overflow-visible pbs-0 pbe-6 pli-12 sm:pli-12'>
          <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4' disabled={isSubmitting}>
            <i className='ri-close-line text-textSecondary' />
          </IconButton>

          {loadingDropdown ? (
            <Box className="flex justify-center items-center h-40">
              <CircularProgress />
            </Box>
          ) : (
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
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Button 
                              size="small" 
                              onClick={handleGenerateSKU}
                              disabled={isSubmitting}
                            >
                              Generate
                            </Button>
                          </InputAdornment>
                        ),
                      }}
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
                            {category.name}
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
                            {unit.name}
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
                            {tax.name} ({tax.taxRate}%)
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
                        Upload Image
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
                          Image selected: {selectedFile.name}
                        </Typography>
                      )}
                      {imagePreview && (
                        <Box mt={2}>
                          <Avatar
                            src={imagePreview}
                            variant="rounded"
                            sx={{ width: 100, height: 100 }}
                            onError={handleImageError}
                          />
                        </Box>
                      )}
                    </Box>
                  )}
                />
              </Grid>
            </Grid>
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
            variant='contained'
            type='submit'
            disabled={isSubmitting || loadingDropdown}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Adding...' : 'Add Product'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddProductDialog;