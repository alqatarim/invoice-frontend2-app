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
  CircularProgress,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Chip,
  Skeleton,
} from '@mui/material';
import  IconButton  from '@core/components/mui/CustomOriginalIconButton';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { getDropdownData } from '@/app/(dashboard)/products/actions';
import { formIcons, taxTypes } from '@/data/dataSets';
import { useAddProductHandlers } from '@/handlers/products/addProduct';
import { getNameFromPath } from '@/utils/fileUtils';

const AddProductDialog = ({ open, onClose, onSave }) => {
  const theme = useTheme();
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
    imagePreview,
    selectedFile,
    imageError,
    handleImageChange,
    handleImageError,
    handleImageDelete,
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
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

  const watchDiscountType = watch('discountType');
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
        Add New Product
      </DialogTitle>

      <DialogContent className='overflow-visible pbs-0 pbe-3 pli-0' sx={{ p: 0 }}>
        <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4' disabled={isSubmitting}>
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
        ) : (
          <Box className="p-6">
            {/* Image Upload - Social Media Style - Top Center */}
            <Box className="flex justify-center mb-6">
              <Controller
                name="images"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Box>
                 
                    
                    {imagePreview ? (
                      // Image Preview with Social Media Style Controls
                      <Box
                        sx={{
                          position: 'relative',
                          display: 'inline-block',
                          borderRadius: 2,
                          overflow: 'hidden',
                          border: '1px solid',
                          borderColor: 'divider',
                          backgroundColor: 'background.paper',
                          width: { xs: '280px', sm: '320px', md: '350px' },
                          height: '200px'
                        }}
                      >
                        <Box
                          sx={{
                            position: 'relative',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'grey.50',
                            width: '100%',
                            height: '100%'
                          }}
                        >
                          <img
                            src={imagePreview}
                            alt="Product Preview"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              objectPosition: 'center',
                              borderRadius: 'inherit',
                              display: 'block'
                            }}
                            onError={handleImageError}
                          />
                          
                          {/* Filename Overlay at Bottom */}
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 8,
                              left: 8,
                              right: 8,
                              display: 'flex',
                              justifyContent: 'center'
                            }}
                          >
                            <Chip
                              label={getNameFromPath(imagePreview, selectedFile)}
                              size="small"
                              color="info"
                              variant="filled"
                             
                            />
                          </Box>
                          
                          {/* Overlay Actions */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              display: 'flex',
                              gap: 1,
                              opacity: 1
                            }}
                          >

                             {/* Replace Button */}
                             <IconButton
                              variant="contained"
                              size="small"
                              color="primary"
                              disabled={isSubmitting}
                              onClick={() => {
                                // Trigger the file input click
                                const fileInput = document.querySelector('#replace-image-input');
                                if (fileInput) {
                                  fileInput.click();
                                }
                              }}
                            >
                              <Icon icon="mdi:cloud-upload-outline" />
                              <input
                                id="replace-image-input"
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
                            </IconButton>

                            {/* Delete Button */}
                            <IconButton
                              size="small"
                              onClick={handleImageDelete}
                              disabled={isSubmitting}
                              color="error"
                              variant="contained"
                             
                            >
                              <Icon icon="mdi:delete-outline" />
                            </IconButton>
                            
                           
                          </Box>
                        </Box>
                      </Box>
                    ) 
                    
                    : (
                      // Upload Area - Social Media Style with Drag & Drop
                      <Box
                        component="label"
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={(e) => {
                          handleDrop(e);
                          const file = e.dataTransfer.files[0];
                          if (file) {
                            onChange(file);
                          }
                        }}

                        sx={{
                          width: { xs: '200px', sm: '200px', md: '200px' },
                          height: '200px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          cursor: 'pointer',
                          border: '2px dashed',
                          borderColor: isDragging ? 'primary.main' : 'secondary.light',
                          borderRadius: 2,
                          backgroundColor: isDragging ? 'primary.lighter' : '',
                          transition: 'all 0.2s ease-in-out',
                          transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                          '&:hover': {
                            borderColor: 'primary.main',
                            backgroundColor: theme.palette.primary.lightOpacity,
                            transform: 'scale(1.04)'
                          }
                        }}
                      >
                        <Icon 
                          icon={isDragging ? "mdi:download" : "mdi:cloud-upload-outline"} 
                          width={48} 
                          color={isDragging ? theme.palette.primary.main : theme.palette.text.secondary}
                          style={{ marginBottom: 12, pointerEvents: 'none' }}
                        />
                        <Typography 
                          variant="body2" 
                          color={isDragging ? "primary" : "text.primary"} 
                          fontWeight={500}
                          sx={{ pointerEvents: 'none' }}
                        >
                          {isDragging ? "Drop image here" : "Click or drag to Upload Image"}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          className="text-center mt-1"
                          sx={{ pointerEvents: 'none' }}
                        >
                          PNG, JPG up to 5MB
                        </Typography>
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
                      </Box>
                    )
                    }
                    
                    {/* Error Message */}
                    {imageError && (
                      <Typography variant="caption" color="error" className='block mt-2 text-center'>
                        <Icon icon="mdi:alert-circle" width={16} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        {imageError}
                      </Typography>
                    )}
                  </Box>
                )}
              />
            </Box>

            <form onSubmit={handleSubmit(handleFormSubmit)} id="add-product-form">
              <Grid container spacing={4}>

                {/* Product Name */}
                <Grid size={{xs:12, sm:12, md:4}}>
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

                {/* Product Type */}
                <Grid size={{xs:12, sm:6, md:4}}>
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
                            watchType && formIcons.find(icon => icon.value === watchType)?.icon && (
                              <Icon
                                style={{ marginRight: '5px' }}
                                icon={formIcons.find(icon => icon.value === watchType)?.icon}
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

                {/* Category */}
                <Grid size={{xs:12, sm:6, md:4}}>
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
                <Grid size={{xs:12, sm:6, md:4}}>
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

                  {/* Purchase Price */}
                  <Grid size={{xs:12, sm:6, md:4}}>
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

                {/* Selling Price */}
                <Grid size={{xs:12, sm:6, md:4}}>
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

                {/* Discount Value */}
                <Grid size={{xs:12, sm:6, md:4}}>
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
                <Grid size={{xs:12, sm:6, md:4}}>
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

                {/* Tax */}
                <Grid size={{xs:12, sm:6, md:4}}>
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

                {/* Alert Quantity */}
                <Grid size={{xs:12, sm:6, md:4}}>
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
                
                {/* SKU */}
                <Grid size={{xs:12, sm:6, md:4}}>
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

                {/* Barcode */}
                <Grid size={{xs:12, sm:6, md:4}}>
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




              </Grid>
            </form>
          </Box>
        )}
      </DialogContent>

      <DialogActions className='gap-2 justify-center pbs-0 pbe-10 pli-10 sm:pbe-12 sm:pli-16'>
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
          form="add-product-form"
          variant='contained'
          disabled={isSubmitting || loading}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'Adding...' : 'Add Product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProductDialog;