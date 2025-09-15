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
import { useAddCategoryHandlers } from '@/handlers/categories/addCategory';
import { formIcons } from '@/data/dataSets';

const AddCategoryDialog = ({ open, onClose, onSave }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    control,
    handleSubmit,
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
        Add New Category
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
            </Grid>
          </Box>
        ) : (
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

            <form onSubmit={handleSubmit(handleFormSubmit)} id="add-category-form">
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
          form="add-category-form"
          variant='contained'
          disabled={isSubmitting || loading}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'Adding...' : 'Add Category'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCategoryDialog;
