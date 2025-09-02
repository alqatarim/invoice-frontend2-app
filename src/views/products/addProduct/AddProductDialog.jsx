import React, { useEffect } from 'react';
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
import { getDropdownData } from '@/app/(dashboard)/products/actions';

import { useAddProductHandlers } from '@/handlers/products/addProduct';

const AddProductDialog = ({ open, onClose, onSave }) => {
  const theme = useTheme();
  const [dropdownData, setDropdownData] = React.useState({ units: [], categories: [], taxes: [] });
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
    imagePreview,
    handleImageChange,
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

  const watchDiscountValue = watch('discountValue');
  const watchType = watch('type');

  // Fetch dropdown data when dialog opens
  useEffect(() => {
    const fetchDropdownData = async () => {
      if (open) {
        setLoading(true);
        try {
          const response = await getDropdownData();
          if (response.success) {
            setDropdownData(response.data || { units: [], categories: [], taxes: [] });
          } else {
            setDropdownData({ units: [], categories: [], taxes: [] });
          }
        } catch (error) {
          console.error('Failed to fetch dropdown data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDropdownData();
  }, [open]);

  const handleClose = () => {
    reset();
    setDropdownData({ units: [], categories: [], taxes: [] });
    onClose();
  };

  if (!open) return null;

  return (
    <Dialog fullWidth open={open} onClose={handleClose} maxWidth='md' scroll='body'>
      <DialogTitle
        variant='h4'
        className='flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16'
      >
        Add New Product
      </DialogTitle>

      <DialogContent className='overflow-visible pbs-0 pbe-6 pli-12 sm:pli-12'>
        <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4' disabled={isSubmitting}>
          <i className='ri-close-line text-textSecondary' />
        </IconButton>

        {loading ? (
          <Box className="flex justify-center items-center h-40">
            <CircularProgress />
            <Typography className="ml-3">Loading form data...</Typography>
          </Box>
        ) : (
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

              {/* Product Image */}
              <Grid size={{xs:12}}>
                <FormLabel className='text-base font-medium mb-3 block'>Product Image</FormLabel>
                <Controller
                  name='images'
                  control={control}
                  render={({ field }) => (
                    <Box>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          field.onChange(e.target.files[0]);
                          handleImageChange(e);
                        }}
                        style={{ marginBottom: '10px' }}
                      />
                      {imagePreview && (
                        <Box
                          component="img"
                          src={imagePreview}
                          alt="Preview"
                          sx={{
                            width: 100,
                            height: 100,
                            objectFit: 'contain',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            mt: 1
                          }}
                        />
                      )}
                    </Box>
                  )}
                />
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
                      label='SKU (Auto-generated if empty)'
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
                        {(dropdownData.categories || []).map((cat) => (
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
                        {(dropdownData.units || []).map((unit) => (
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
                      label='Discount Value (Optional)'
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
                      label='Barcode (Optional)'
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
                      <InputLabel>Tax (Optional)</InputLabel>
                      <Select {...field} label='Tax (Optional)'>
                        <MenuItem value="">None</MenuItem>
                        {(dropdownData.taxes || []).map((tax) => (
                          <MenuItem key={tax._id} value={tax._id}>
                            {tax.name} ({tax.tax_percentage}%)
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
                      label='Product Description (Optional)'
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
        )}
      </DialogContent>

      <DialogActions className='flex justify-center pbs-0 pbe-10 pli-10 sm:pbe-16 sm:pli-16'>
        <Button color='secondary' variant='outlined' onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          variant='contained' 
          onClick={handleSubmit(handleFormSubmit)} 
          disabled={isSubmitting || loading}
        >
          {isSubmitting ? <CircularProgress size={20} /> : 'Add Product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProductDialog;