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
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { getCategoryById } from '@/app/(dashboard)/categories/actions';
import { useEditCategoryHandlers } from '@/handlers/categories/editCategory';
import { formIcons } from '@/data/dataSets';

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
  } = useEditCategoryHandlers({
    categoryData,
    onSave: async (data) => {
      const result = await onSave(categoryId, data);
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
            setCategoryData(categoryResponse);
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
                        setCategoryData(categoryResponse);
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
            {/* Category Icon - Centered at top like product image */}
            <Box className="flex justify-center mb-6">
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  backgroundColor: theme.palette.primary.main,
                  fontSize: '3rem'
                }}
              >
                <Icon icon="mdi:shape" width={60} />
              </Avatar>
            </Box>

            <form onSubmit={handleSubmit(handleFormSubmit)} id="edit-category-form">
              <Grid container spacing={4}>
                {/* Category Name */}
                <Grid size={{xs:12}}>
                  <Controller
                    name="category_name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Category Name"
                        placeholder="Enter category name"
                        error={!!errors.category_name}
                        helperText={errors.category_name?.message}
                        disabled={isSubmitting}
                        required
                        InputProps={{
                          startAdornment: ( 
                            <Icon
                              style={{ marginRight: '5px' }}
                              icon={'mdi:shape'}
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

                {/* Category Description (optional) */}
                <Grid size={{xs:12}}>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Description (Optional)"
                        placeholder="Enter category description"
                        multiline
                        rows={3}
                        disabled={isSubmitting}
                        InputProps={{
                          startAdornment: ( 
                            <Icon
                              style={{ marginRight: '5px', alignSelf: 'flex-start', marginTop: '12px' }}
                              icon={'mdi:text'}
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
