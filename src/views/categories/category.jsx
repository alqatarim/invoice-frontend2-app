'use client'

import React from 'react'
import { Controller } from 'react-hook-form'
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
  Skeleton,
  Chip,
  MenuItem,
  FormControlLabel,
  Switch
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Icon } from '@iconify/react'
import CustomIconButton from '@core/components/mui/CustomOriginalIconButton'
import { getNameFromPath } from '@/utils/fileUtils'

const Category = ({
  controller,
  title,
  submitLabel,
  submittingLabel,
  closeLabel = 'Cancel',
  onEdit
}) => {
  const theme = useTheme()
  const {
    mode,
    control,
    handleSubmit,
    errors,
    isSubmitting,
    handleFormSubmit,
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
    loading,
    error,
    handleClose,
    retryLoad,
    optionsLoading,
    dropdownOptions,
    parentOptions,
    categoryData
  } = controller

  const isViewMode = mode === 'view'
  const replaceInputId = `${mode}-category-image-input`
  const canRenderForm = mode === 'add' || Boolean(categoryData)
  const statusLabel = categoryData?.status !== false ? 'Active' : 'Inactive'
  const parentCategoryLabel = categoryData?.parentCategory?.name || 'None'
  const taxLabel = categoryData?.tax?.name
    ? `${categoryData.tax.name}${categoryData.tax.taxRate ? ` (${categoryData.tax.taxRate}%)` : ''}`
    : 'None'

  return (
    <Dialog
      fullWidth
      open
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
        {title}
      </DialogTitle>

      <DialogContent className='overflow-visible pbs-0 pbe-3 pli-0' sx={{ p: 0 }}>
        <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4' disabled={isSubmitting}>
          <i className='ri-close-line text-textSecondary' />
        </IconButton>

        {loading ? (
          <Box className='p-6'>
            <Box className='flex justify-center mb-6'>
              <Skeleton
                variant='rectangular'
                sx={{
                  width: '200px',
                  height: '200px',
                  borderRadius: 2
                }}
              />
            </Box>

            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Skeleton variant='rounded' height={56} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Skeleton variant='rounded' height={56} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Skeleton variant='rounded' height={56} />
              </Grid>
            </Grid>
          </Box>
        ) : error ? (
          <Box className='flex flex-col justify-center items-center h-40 gap-4'>
            <Typography color='error' variant='h6'>Error Loading Category</Typography>
            <Typography color='error'>{error}</Typography>
            <Button variant='outlined' color='primary' onClick={() => void retryLoad()}>
              Retry
            </Button>
          </Box>
        ) : canRenderForm ? (
          <Box className='p-6'>
            <Box className='flex justify-center mb-6'>
              {isViewMode ? (
                <Box>
                  {imagePreview ? (
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
                          alt={categoryData?.name || 'Category Preview'}
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
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: { xs: '200px', sm: '200px', md: '200px' },
                        height: '200px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        border: '2px dashed',
                        borderColor: 'secondary.light',
                        borderRadius: 2
                      }}
                    >
                      <Icon
                        icon='mdi:image-outline'
                        width={48}
                        color={theme.palette.text.secondary}
                        style={{ marginBottom: 12 }}
                      />
                      <Typography variant='body2' color='text.secondary' fontWeight={500}>
                        No image uploaded
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Controller
                  name='images'
                  control={control}
                  render={({ field: { onChange } }) => (
                    <Box>
                      {imagePreview ? (
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
                              alt={categoryData?.name || 'Category Preview'}
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
                                size='small'
                                color='info'
                                variant='filled'
                              />
                            </Box>

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
                              <CustomIconButton
                                variant='contained'
                                size='small'
                                color='primary'
                                disabled={isSubmitting}
                                onClick={() => {
                                  const fileInput = document.querySelector(`#${replaceInputId}`)

                                  if (fileInput) {
                                    fileInput.click()
                                  }
                                }}
                              >
                                <Icon icon='mdi:cloud-upload-outline' />
                                <input
                                  id={replaceInputId}
                                  type='file'
                                  hidden
                                  accept='image/*'
                                  onChange={event => {
                                    handleImageChange(event)
                                    const file = event.target.files[0]

                                    if (file) {
                                      onChange(file)
                                    }
                                  }}
                                />
                              </CustomIconButton>

                              <CustomIconButton
                                size='small'
                                onClick={handleImageDelete}
                                disabled={isSubmitting}
                                color='error'
                                variant='contained'
                              >
                                <Icon icon='mdi:delete-outline' />
                              </CustomIconButton>
                            </Box>
                          </Box>
                        </Box>
                      ) : (
                        <Box
                          component='label'
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          onDragOver={handleDragOver}
                          onDrop={event => {
                            handleDrop(event)
                            const file = event.dataTransfer.files[0]

                            if (file) {
                              onChange(file)
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
                            icon={isDragging ? 'mdi:download' : 'mdi:cloud-upload-outline'}
                            width={48}
                            color={isDragging ? theme.palette.primary.main : theme.palette.text.secondary}
                            style={{ marginBottom: 12, pointerEvents: 'none' }}
                          />
                          <Typography
                            variant='body2'
                            color={isDragging ? 'primary' : 'text.primary'}
                            fontWeight={500}
                            sx={{ pointerEvents: 'none' }}
                          >
                            {isDragging ? 'Drop image here' : 'Click or drag to Upload Image'}
                          </Typography>
                          <Typography
                            variant='caption'
                            color='text.secondary'
                            className='text-center mt-1'
                            sx={{ pointerEvents: 'none' }}
                          >
                            PNG, JPG up to 5MB
                          </Typography>
                          <input
                            type='file'
                            hidden
                            accept='image/*'
                            onChange={event => {
                              handleImageChange(event)
                              const file = event.target.files[0]

                              if (file) {
                                onChange(file)
                              }
                            }}
                          />
                        </Box>
                      )}

                      {imageError && (
                        <Typography variant='caption' color='error' className='block mt-2 text-center'>
                          <Icon icon='mdi:alert-circle' width={16} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                          {imageError}
                        </Typography>
                      )}
                    </Box>
                  )}
                />
              )}
            </Box>

            {isViewMode ? (
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label='Category Name'
                    value={categoryData?.name || ''}
                    InputProps={{ readOnly: true }}
                    variant='outlined'
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label='Slug'
                    value={categoryData?.slug || ''}
                    InputProps={{ readOnly: true }}
                    variant='outlined'
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label='Parent Category'
                    value={parentCategoryLabel}
                    InputProps={{ readOnly: true }}
                    variant='outlined'
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label='Tax Classification'
                    value={taxLabel}
                    InputProps={{ readOnly: true }}
                    variant='outlined'
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label='Status'
                    value={statusLabel}
                    InputProps={{ readOnly: true }}
                    variant='outlined'
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Category ID: {categoryData?._id || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            ) : (
              <form onSubmit={handleSubmit(handleFormSubmit)} id={`${mode}-category-form`}>
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name='name'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label='Category Name'
                          placeholder='Enter category name'
                          error={!!errors.name}
                          helperText={errors.name?.message}
                          disabled={isSubmitting}
                          required
                          InputProps={{
                            startAdornment: (
                              <Icon
                                style={{ marginRight: '5px' }}
                                icon='mdi:category-outline'
                                width={23}
                                color={theme.palette.secondary.light}
                              />
                            )
                          }}
                          variant='outlined'
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name='slug'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label='Slug'
                          placeholder='Enter category slug'
                          error={!!errors.slug}
                          helperText={errors.slug?.message}
                          disabled={isSubmitting}
                          required
                          variant='outlined'
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name='parentCategory'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          fullWidth
                          label='Parent Category'
                          disabled={isSubmitting || optionsLoading}
                          variant='outlined'
                        >
                          <MenuItem value=''>None</MenuItem>
                          {(mode === 'edit' ? parentOptions : dropdownOptions.categories || []).map(category => (
                            <MenuItem key={category._id} value={category._id}>
                              {category.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name='tax'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          fullWidth
                          label='Tax Classification'
                          disabled={isSubmitting || optionsLoading}
                          variant='outlined'
                        >
                          <MenuItem value=''>No Tax</MenuItem>
                          {(dropdownOptions.taxes || []).map(tax => (
                            <MenuItem key={tax._id} value={tax._id}>
                              {tax.name} {tax.taxRate ? `(${tax.taxRate}%)` : ''}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Controller
                      name='status'
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={!!field.value}
                              onChange={event => field.onChange(event.target.checked)}
                              color='success'
                            />
                          }
                          label={field.value ? 'Active' : 'Inactive'}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </form>
            )}
          </Box>
        ) : (
          <Box className='flex justify-center items-center h-40'>
            <Typography color='error'>Failed to load category data</Typography>
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
          {closeLabel}
        </Button>
        {isViewMode ? (
          onEdit && (
            <Button
              variant='contained'
              onClick={() => onEdit(categoryData?._id)}
              disabled={!categoryData?._id}
              startIcon={<Icon icon='mdi:pencil-outline' />}
            >
              Edit Category
            </Button>
          )
        ) : (
          <Button
            type='submit'
            form={`${mode}-category-form`}
            variant='contained'
            disabled={isSubmitting || loading || (mode === 'edit' && !categoryData)}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? submittingLabel : submitLabel}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default Category
