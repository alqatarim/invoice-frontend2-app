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
  Box,
  IconButton,
  CircularProgress,
  Typography,
  Avatar,
  Skeleton,
  Chip,
} from '@mui/material';
import  CustomIconButton  from '@core/components/mui/CustomOriginalIconButton';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { getCategoryById } from '@/app/(dashboard)/categories/actions';
import { useEditCategoryHandlers } from '@/handlers/categories/editCategory';
import { formIcons } from '@/data/dataSets';
import { getNameFromPath } from '@/utils/fileUtils';

const EditCategoryDialog = ({ open, categoryId, onClose, onSave }) => {
  const theme = useTheme();
  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    control,
    handleSubmit,
    errors,
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
  } = useEditCategoryHandlers({
    categoryData,
    onSave: async (data, preparedImage) => {
      const result = await onSave(categoryId, data, preparedImage);
      if (result.success) {
        onClose();
      }
      return result;
    },
  });

  // Fetch category data when dialog opens
  useEffect(() => {
    const fetchData = async () => {
      if (open && categoryId) {
        setLoading(true);
        setError(null);
        try {
          const categoryResponse = await getCategoryById(categoryId);
          
          if (categoryResponse && typeof categoryResponse === 'object') {
            // Extract category_details from the response structure
            const categoryDetails = categoryResponse.category_details;
            setCategoryData(categoryDetails);
          } else {
            throw new Error('Invalid category data received');
          }
        } catch (error) {
          console.error('Failed to fetch category data:', error);
          setError(error.message || 'Failed to load category data');
          setCategoryData(null);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [open, categoryId]);

  const handleClose = () => {
    setCategoryData(null);
    setError(null);
    onClose();
  };

  if (!open) return null;

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleClose}
      maxWidth='sm'
      scroll='body'
      sx={{ '& .MuiDialog-container': { alignItems: 'flex-start' } }}
      PaperProps={{ 
        sx: { 
          mt: { xs: 4, sm: 6 }, 
          width: '100%',
          minWidth: { xs: '90vw', sm: '400px' },
          minHeight: { xs: 'auto', sm: 'auto' }
        } 
      }}
    >
      <DialogTitle
        variant='h4'
        className='flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-8 sm:pbe-0 sm:pli-16'
      >
        Edit Category
      </DialogTitle>

      <DialogContent className='overflow-visible pbs-0 pbe-3 pli-0' sx={{ p: 0 }}>
        <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4' disabled={isSubmitting}>
          <i className='ri-close-line text-textSecondary' />
        </IconButton>

        {loading ? (
          <Box className="p-6">
            {/* Category Icon Skeleton */}
            <Box className="flex justify-center mb-6">
              <Skeleton 
                variant="circular" 
                sx={{ 
                  width: '100px',
                  height: '100px'
                }} 
              />
            </Box>

            {/* Form Skeleton */}
            <Grid container spacing={4}>
              <Grid size={{xs:12}}>
                <Skeleton variant="rounded" height={56} />
              </Grid>
              <Grid size={{xs:12}}>
                <Skeleton variant="rounded" height={100} />
              </Grid>
            </Grid>
          </Box>
        ) : error ? (
          <Box className="flex flex-col justify-center items-center h-40 gap-4">
            <Typography color="error" variant="h6">Error Loading Category</Typography>
            <Typography color="error">{error}</Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => {
                setError(null);
                // Trigger refetch
                const fetchData = async () => {
                  if (open && categoryId) {
                    setLoading(true);
                    setError(null);
                    try {
                      const categoryResponse = await getCategoryById(categoryId);
                      
                      if (categoryResponse && typeof categoryResponse === 'object') {
                        // Extract category_details from the response structure
                        const categoryDetails = categoryResponse.category_details || categoryResponse;
                        setCategoryData(categoryDetails);
                      } else {
                        throw new Error('Invalid category data received');
                      }
                    } catch (error) {
                      console.error('Failed to fetch category data:', error);
                      setError(error.message || 'Failed to load category data');
                      setCategoryData(null);
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
        ) : categoryData ? (
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
                            alt={categoryData?.name}
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
                             <CustomIconButton
                              variant="contained"
                              size="small"
                              color="primary"
                              disabled={isSubmitting}
                              onClick={() => {
                                // Trigger the file input click
                                const fileInput = document.querySelector('#replace-category-image-input');
                                if (fileInput) {
                                  fileInput.click();
                                }
                              }}
                            >
                              <Icon icon="mdi:cloud-upload-outline" />
                              <input
                                id="replace-category-image-input"
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
                            </CustomIconButton>

                            {/* Delete Button */}
                            <CustomIconButton
                              size="small"
                              onClick={handleImageDelete}
                              disabled={isSubmitting}
                              color="error"
                              variant="contained"
                            >
                              <Icon icon="mdi:delete-outline" />
                            </CustomIconButton>
                          </Box>
                        </Box>
                      </Box>
                    ) : (
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
                    )}
                    
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

            <form onSubmit={handleSubmit(handleFormSubmit)} id="edit-category-form">
              <Grid container spacing={4}>
                {/* Category Name */}
                <Grid size={{xs:12, sm:6, md:6}}>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Category Name"
                        placeholder="Enter category name"
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        disabled={isSubmitting}
                        required
                        InputProps={{
                          startAdornment: ( 
                            <Icon
                              style={{ marginRight: '5px' }}
                              icon={'mdi:category-outline'}
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

                {/* Category Slug */}
                <Grid size={{xs:12, sm:6, md:6}}>
                  <Controller
                    name="slug"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Slug"
                        placeholder="Enter category slug"
                        disabled={isSubmitting}
                         variant="outlined"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </form>
          </Box>
        ) : (
          <Box className="flex justify-center items-center h-40">
            <Typography color="error">Failed to load category data</Typography>
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
          form="edit-category-form"
          variant='contained'
          disabled={isSubmitting || loading || !categoryData}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'Updating...' : 'Update Category'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCategoryDialog;
