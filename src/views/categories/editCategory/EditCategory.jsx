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
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { getCategoryById } from '@/app/(dashboard)/categories/actions';
import { useEditCategoryHandlers } from '@/handlers/categories/editCategory';

const EditCategoryDialog = ({ open, categoryId, onClose, onSave }) => {
  const theme = useTheme();
  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(false);

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
        try {
          const categoryResponse = await getCategoryById(categoryId);
          setCategoryData(categoryResponse);
        } catch (error) {
          console.error('Failed to fetch category data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [open, categoryId]);

  const handleClose = () => {
    setCategoryData(null);
    onClose();
  };

  if (!open) return null;

  return (
    <Dialog fullWidth open={open} onClose={handleClose} maxWidth='sm' scroll='body'>
      <DialogTitle
        variant='h4'
        className='flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16'
      >
        Edit Category
      </DialogTitle>

      <DialogContent className='overflow-visible pbs-0 pbe-6 pli-12 sm:pli-12'>
        <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4' disabled={isSubmitting}>
          <i className='ri-close-line text-textSecondary' />
        </IconButton>

        {loading ? (
          <Box className="flex justify-center items-center h-40">
            <CircularProgress />
            <Typography className="ml-3">Loading category data...</Typography>
          </Box>
        ) : categoryData ? (
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
                    />
                  )}
                />
              </Grid>
            </Grid>
          </form>
        ) : (
          <Box className="flex justify-center items-center h-40">
            <Typography color="error">Failed to load category data</Typography>
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
