import React from 'react';
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
  Switch,
  Box,
  IconButton,
  CircularProgress,
  Typography,
  FormControlLabel,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAddCategoryHandlers } from '@/handlers/products/category/addCategory';

const AddCategoryDialog = ({ open, onClose, onSave }) => {
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    watch,
    errors,
    isSubmitting,
    handleFormSubmit,
    reset,
  } = useAddCategoryHandlers({
    onSave: async (data) => {
      const result = await onSave(data);
      if (result.success) {
        reset();
        onClose();
      }
      return result;
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!open) return null;

  return (
    <Dialog fullWidth open={open} onClose={handleClose} maxWidth='sm' scroll='body'>
      <DialogTitle
        variant='h4'
        className='flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16'
      >
        Add New Category
      </DialogTitle>

      <DialogContent className='overflow-visible pbs-0 pbe-6 pli-12 sm:pli-12'>
        <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4' disabled={isSubmitting}>
          <i className='ri-close-line text-textSecondary' />
        </IconButton>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Grid container spacing={5}>
            {/* Category Name */}
            <Grid size={{xs:12}}>
              <Controller
                name='category_name'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Category Name'
                    error={Boolean(errors.category_name)}
                    helperText={errors.category_name?.message}
                    autoFocus
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
      </DialogContent>

      <DialogActions className='flex justify-center pbs-0 pbe-10 pli-10 sm:pbe-16 sm:pli-16'>
        <Button color='secondary' variant='outlined' onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          variant='contained' 
          onClick={handleSubmit(handleFormSubmit)} 
          disabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={20} /> : 'Add Category'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCategoryDialog;