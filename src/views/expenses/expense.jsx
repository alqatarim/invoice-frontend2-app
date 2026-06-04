'use client';

import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Skeleton,
  Grid,
} from '@mui/material';
import IconButton from '@core/components/mui/CustomOriginalIconButton';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';

import { expenseSchema } from './expenseSchema';
import { paymentMethods, formIcons } from '@/data/dataSets';
import {
  getNameFromPath,
  isImageFile,
  normalizeFileSource,
  validateExpenseAttachment,
} from '@/utils/fileUtils';

const useExpenseFormHandler = ({ mode, expenseNumber, expenseData, onSave }) => {
  const isEdit = mode === 'edit';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageError, setImageError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(expenseSchema),
    defaultValues: {
      expenseId: expenseNumber || '',
      reference: '',
      amount: '',
      paymentMode: '',
      expenseDate: dayjs(),
      attachment: null,
    },
  });

  useEffect(() => {
    if (!isEdit && expenseNumber) {
      setValue('expenseId', expenseNumber);
    }
  }, [expenseNumber, isEdit, setValue]);

  useEffect(() => {
    if (!isEdit || !expenseData || typeof expenseData !== 'object') return;

    setImagePreview(normalizeFileSource(expenseData.expenseDetails?.attachment));
    setSelectedFile(null);
    setImageError('');

    reset({
      expenseId: expenseData.expenseDetails?.expenseId || '',
      reference: expenseData.expenseDetails?.reference || '',
      amount: expenseData.expenseDetails?.amount || '',
      paymentMode: expenseData.expenseDetails?.paymentMode || '',
      expenseDate: expenseData.expenseDetails?.expenseDate
        ? dayjs(expenseData.expenseDetails.expenseDate)
        : dayjs(),
      attachment: null,
    });
  }, [expenseData, isEdit, reset]);

  const restoreExistingPreview = () => {
    setImagePreview(normalizeFileSource(expenseData?.expenseDetails?.attachment));
  };

  const handleImageChange = async event => {
    const file = event.target.files[0];
    if (!file) return;

    const validation = await validateExpenseAttachment(file);

    if (validation.isValid) {
      setImagePreview(validation.preview);
      setSelectedFile(file);
      setImageError('');
    } else {
      setImageError(validation.error);
      if (isEdit) {
        restoreExistingPreview();
      } else {
        setImagePreview(null);
      }
      setSelectedFile(null);
    }
  };

  const handleImageError = () => {
    setImagePreview(null);
    setImageError('');
  };

  const handleImageDelete = () => {
    setImagePreview(null);
    setSelectedFile(null);
    setImageError('');
    setValue('attachment', null);
  };

  const handleDragEnter = event => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = event => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = event => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = async event => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const files = event.dataTransfer.files;
    if (!files?.[0]) return;

    const file = files[0];
    const validation = await validateExpenseAttachment(file);

    if (validation.isValid) {
      setImagePreview(validation.preview);
      setSelectedFile(file);
      setImageError('');
      setValue('attachment', file);
    } else {
      setImageError(validation.error);
      if (isEdit) {
        restoreExistingPreview();
      } else {
        setImagePreview(null);
      }
      setSelectedFile(null);
    }
  };

  const prepareAttachment = async () => {
    if (!selectedFile) return null;

    const reader = new FileReader();
    const base64 = await new Promise(resolve => {
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(selectedFile);
    });

    return {
      base64,
      type: selectedFile.type,
      name: selectedFile.name,
    };
  };

  const handleFormSubmit = async (data, status = 'Pending') => {
    setIsSubmitting(true);
    try {
      const preparedAttachment = await prepareAttachment();
      const { attachment, ...expenseFields } = data;
      const payload = {
        ...expenseFields,
        status: isEdit ? expenseData?.expenseDetails?.status || 'Pending' : status,
      };
      return await onSave(payload, preparedAttachment);
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'adding'} expense:`, error);
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    reset({
      expenseId: expenseNumber || '',
      reference: '',
      amount: '',
      paymentMode: '',
      expenseDate: dayjs(),
      attachment: null,
    });
    setImagePreview(null);
    setSelectedFile(null);
    setImageError('');
    setIsDragging(false);
  };

  return {
    control,
    handleSubmit,
    errors,
    isSubmitting,
    handleFormSubmit,
    reset: resetForm,
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
  };
};

const DIALOG_PAPER_PROPS = {
  sx: {
    mt: { xs: 4, sm: 6 },
    width: '100%',
    minWidth: { xs: '90vw', sm: '600px', md: '800px' },
    minHeight: { xs: '70vh', sm: '600px' },
  },
};

const ATTACHMENT_BOX_SIZE_SX = {
  width: { xs: '280px', sm: '320px', md: '350px' },
  height: '200px',
};

const MODE_TITLES = {
  add: 'Add New Expense',
  edit: 'Edit Expense',
  view: 'View Expense',
};

const ExpenseFormFields = ({
  control,
  errors,
  isSubmitting,
  theme,
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
  replaceInputId,
  formId,
  onFormSubmit,
  expenseLabel,
}) => (
  <Box className="p-6">
    <Box className="flex justify-center mb-6">
      <Controller
        name="attachment"
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
                  ...ATTACHMENT_BOX_SIZE_SX,
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
                    height: '100%',
                  }}
                >
                  {isImageFile(imagePreview) || imagePreview.startsWith('data:image') ? (
                    <img
                      src={imagePreview}
                      alt={expenseLabel || 'Expense Attachment Preview'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        objectPosition: 'center',
                        borderRadius: 'inherit',
                        display: 'block',
                      }}
                      onError={handleImageError}
                    />
                  ) : (
                    <Box sx={{ textAlign: 'center' }}>
                      <Icon icon="mdi:file-document-outline" width={60} color={theme.palette.primary.main} />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {getNameFromPath(imagePreview, selectedFile)}
                      </Typography>
                    </Box>
                  )}

                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      display: 'flex',
                      gap: 1,
                    }}
                  >
                    <IconButton
                      variant="contained"
                      size="small"
                      color="primary"
                      disabled={isSubmitting}
                      onClick={() => {
                        const fileInput = document.querySelector(`#${replaceInputId}`);
                        fileInput?.click();
                      }}
                    >
                      <Icon icon="mdi:cloud-upload-outline" />
                      <input
                        id={replaceInputId}
                        type="file"
                        hidden
                        accept="*/*"
                        onChange={e => {
                          handleImageChange(e);
                          const file = e.target.files[0];
                          if (file) onChange(file);
                        }}
                      />
                    </IconButton>

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
            ) : (
              <Box
                component="label"
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={e => {
                  handleDrop(e);
                  const file = e.dataTransfer.files[0];
                  if (file) onChange(file);
                }}
                sx={{
                  ...ATTACHMENT_BOX_SIZE_SX,
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
                    transform: 'scale(1.04)',
                  },
                }}
              >
                <Icon
                  icon={isDragging ? 'mdi:download' : 'mdi:cloud-upload-outline'}
                  width={48}
                  color={isDragging ? theme.palette.primary.main : theme.palette.text.secondary}
                  style={{ marginBottom: 12, pointerEvents: 'none' }}
                />
                <Typography
                  variant="body2"
                  color={isDragging ? 'primary' : 'text.primary'}
                  fontWeight={500}
                  sx={{ pointerEvents: 'none' }}
                >
                  {isDragging ? 'Drop attachment here' : 'Click or drag to Upload Attachment'}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  className="text-center mt-1"
                  sx={{ pointerEvents: 'none' }}
                >
                  Any file up to 5MB
                </Typography>
                <input
                  type="file"
                  hidden
                  accept="*/*"
                  onChange={e => {
                    handleImageChange(e);
                    const file = e.target.files[0];
                    if (file) onChange(file);
                  }}
                />
              </Box>
            )}

            {imageError && (
              <Typography variant="caption" color="error" className="block mt-2 text-center">
                <Icon icon="mdi:alert-circle" width={16} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                {imageError}
              </Typography>
            )}
          </Box>
        )}
      />
    </Box>

    <form id={formId} onSubmit={onFormSubmit}>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Controller
            name="expenseId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Expense ID"
                placeholder="Auto-generated"
                error={!!errors.expenseId}
                helperText={errors.expenseId?.message}
                disabled
                InputProps={{
                  startAdornment: (
                    <Icon
                      style={{ marginRight: '5px' }}
                      icon={formIcons.find(icon => icon.value === 'id')?.icon || 'mdi:identifier'}
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

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Controller
            name="reference"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Reference"
                placeholder="Enter reference"
                error={!!errors.reference}
                helperText={errors.reference?.message}
                disabled={isSubmitting}
                InputProps={{
                  startAdornment: (
                    <Icon
                      style={{ marginRight: '5px' }}
                      icon={formIcons.find(icon => icon.value === 'reference')?.icon || 'mdi:text-box-outline'}
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

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Amount"
                placeholder="0.00"
                error={!!errors.amount}
                helperText={errors.amount?.message}
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

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Controller
            name="paymentMode"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.paymentMode} required>
                <InputLabel>Payment Mode</InputLabel>
                <Select
                  {...field}
                  label="Payment Mode"
                  disabled={isSubmitting}
                // startAdornment={
                //   <Icon
                //     style={{ marginRight: '5px' }}
                //     icon={formIcons.find(icon => icon.value === 'payment')?.icon || 'mdi:credit-card-outline'}
                //     width={23}
                //     color={theme.palette.secondary.light}
                //   />
                // }
                >
                  {paymentMethods.map(mode => (
                    <MenuItem key={mode.value} value={mode.value}>
                      <Box className="flex items-center gap-2">
                        <Icon icon={mode.icon} width={18} />
                        {mode.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.paymentMode && <FormHelperText>{errors.paymentMode.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Controller
            name="expenseDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                label="Expense Date"
                disabled={isSubmitting}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.expenseDate,
                    helperText: errors.expenseDate?.message,
                    required: true,
                    InputProps: {
                      startAdornment: (
                        <Icon
                          style={{ marginRight: '5px' }}
                          icon={formIcons.find(icon => icon.value === 'date')?.icon || 'mdi:calendar-outline'}
                          width={23}
                          color={theme.palette.secondary.light}
                        />
                      ),
                    },
                  },
                }}
              />
            )}
          />
        </Grid>
      </Grid>
    </form>
  </Box>
);

const ExpenseFormDialog = ({
  mode,
  open,
  onClose,
  onSave,
  expenseNumber,
  expenseData = null,
  loading = false,
  error = '',
  onRetry,
}) => {
  const theme = useTheme();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const isAdd = mode === 'add';
  const isEdit = mode === 'edit';
  const formId = `expense-form-${mode}`;
  const replaceInputId = `replace-attachment-input-${mode}`;

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
  } = useExpenseFormHandler({
    mode,
    expenseNumber,
    expenseData,
    onSave: async (data, preparedAttachment) => {
      const result = await onSave(data, preparedAttachment);
      if (result?.success) {
        if (isAdd) reset();
        onClose();
      }
      return result;
    },
  });

  const handleClose = () => {
    if (isAdd) reset();
    onClose();
  };

  const submitExpense = async (data, status) => {
    const processingMessage = isEdit
      ? 'Updating expense...'
      : status === 'Draft'
        ? 'Saving expense as draft...'
        : 'Adding expense...';

    const loadingKey = enqueueSnackbar(processingMessage, {
      variant: 'info',
      persist: true,
      preventDuplicate: true,
    });

    try {
      return await handleFormSubmit(data, status);
    } finally {
      closeSnackbar(loadingKey);
    }
  };

  const showForm = isAdd || (isEdit && !loading && !error && expenseData);

  if (!open) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        fullWidth
        open={open}
        onClose={handleClose}
        maxWidth="md"
        scroll="body"
        sx={{ '& .MuiDialog-container': { alignItems: 'flex-start' } }}
        PaperProps={DIALOG_PAPER_PROPS}
      >
        <DialogTitle
          variant="h4"
          className="flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-8 sm:pbe-0 sm:pli-16"
        >
          {MODE_TITLES[mode]}
        </DialogTitle>

        <DialogContent className="overflow-visible pbs-0 pbe-3 pli-0" sx={{ p: 0 }}>
          <IconButton
            onClick={handleClose}
            className="absolute block-start-4 inline-end-4"
            disabled={isSubmitting}
          >
            <i className="ri-close-line text-textSecondary" />
          </IconButton>

          {isEdit && loading ? (
            <Box className="p-6">
              <Box className="flex justify-center mb-6">
                <Skeleton variant="rectangular" sx={{ ...ATTACHMENT_BOX_SIZE_SX, borderRadius: 2 }} />
              </Box>
              <Grid container spacing={4}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                    <Skeleton variant="rounded" height={56} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : isEdit && error ? (
            <Box className="flex flex-col justify-center items-center h-40 gap-4">
              <Typography color="error" variant="h6">
                Error Loading Expense
              </Typography>
              <Typography color="error">{error}</Typography>
              <Button variant="outlined" color="primary" onClick={onRetry}>
                Retry
              </Button>
            </Box>
          ) : showForm ? (
            <ExpenseFormFields
              control={control}
              errors={errors}
              isSubmitting={isSubmitting}
              theme={theme}
              imagePreview={imagePreview}
              selectedFile={selectedFile}
              imageError={imageError}
              handleImageChange={handleImageChange}
              handleImageError={handleImageError}
              handleImageDelete={handleImageDelete}
              isDragging={isDragging}
              handleDragEnter={handleDragEnter}
              handleDragLeave={handleDragLeave}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              replaceInputId={replaceInputId}
              formId={formId}
              onFormSubmit={
                isAdd ? handleSubmit(data => submitExpense(data, 'Pending')) : undefined
              }
              expenseLabel={expenseData?.expenseDetails?.expenseId}
            />
          ) : isEdit ? (
            <Box className="flex justify-center items-center h-40">
              <Typography color="error">Expense not found</Typography>
            </Box>
          ) : null}
        </DialogContent>

        {isAdd && showForm && (
          <DialogActions className="gap-2 justify-center pbs-0 pbe-10 pli-10 sm:pbe-12 sm:pli-16">
            <Button variant="outlined" color="secondary" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="outlined"
              color="primary"
              disabled={isSubmitting}
              onClick={handleSubmit(data => submitExpense(data, 'Draft'))}
            >
              Save as Draft
            </Button>
            <Button type="submit" form={formId} variant="contained" disabled={isSubmitting}>
              Add Expense
            </Button>
          </DialogActions>
        )}

        {isEdit && showForm && (
          <DialogActions className="gap-2 justify-center pbs-0 pbe-10 pli-10 sm:pbe-12 sm:pli-16">
            <Button variant="outlined" color="secondary" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={isSubmitting}
              onClick={handleSubmit(data => submitExpense(data))}
            >
              Update Expense
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </LocalizationProvider>
  );
};

const ExpenseViewDialog = ({
  open,
  onClose,
  expenseData = null,
  loading = false,
  error = '',
  onRetry,
}) => {
  const theme = useTheme();
  const expense = expenseData;
  const attachmentPreview = normalizeFileSource(expense?.expenseDetails?.attachment);

  if (!open) return null;

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={onClose}
      maxWidth="md"
      scroll="body"
      sx={{ '& .MuiDialog-container': { alignItems: 'flex-start' } }}
      PaperProps={DIALOG_PAPER_PROPS}
    >
      <DialogTitle
        variant="h4"
        className="flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-8 sm:pbe-0 sm:pli-16"
      >
        {MODE_TITLES.view}
      </DialogTitle>

      <DialogContent className="overflow-visible pbs-0 pbe-3 pli-0" sx={{ p: 0 }}>
        <IconButton onClick={onClose} className="absolute block-start-4 inline-end-4">
          <i className="ri-close-line text-textSecondary" />
        </IconButton>

        {loading ? (
          <Box className="p-6">
            <Box className="flex justify-center mb-6">
              <Skeleton variant="rectangular" sx={{ ...ATTACHMENT_BOX_SIZE_SX, borderRadius: 2 }} />
            </Box>
            <Grid container spacing={4}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                  <Skeleton variant="rounded" height={56} />
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : error ? (
          <Box className="flex flex-col items-center justify-center h-40 gap-4">
            <Typography color="error" variant="h6">
              Error Loading Expense
            </Typography>
            <Typography color="error">{error}</Typography>
            <Button variant="outlined" color="primary" onClick={onRetry}>
              Retry
            </Button>
          </Box>
        ) : expense ? (
          <Box className="p-6">
            <Box className="flex justify-center mb-6">
              <Box
                sx={{
                  ...ATTACHMENT_BOX_SIZE_SX,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'grey.50',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: 'hidden',
                }}
              >
                {attachmentPreview && (isImageFile(attachmentPreview) || attachmentPreview.startsWith('data:image')) ? (
                  <img
                    src={attachmentPreview}
                    alt={expense.expenseDetails?.expenseId || 'Expense'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      objectPosition: 'center',
                    }}
                  />
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <Icon
                      icon={attachmentPreview ? 'mdi:file-document-outline' : 'mdi:image-off-outline'}
                      width={60}
                      color={theme.palette.primary.main}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {attachmentPreview ? getNameFromPath(attachmentPreview) : 'No attachment'}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  fullWidth
                  label="Expense ID"
                  value={expense.expenseDetails?.expenseId || ''}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <Icon
                        style={{ marginRight: '5px' }}
                        icon={formIcons.find(icon => icon.value === 'id')?.icon || 'mdi:identifier'}
                        width={23}
                        color={theme.palette.secondary.light}
                      />
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  fullWidth
                  label="Reference"
                  value={expense.expenseDetails?.reference || ''}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <Icon
                        style={{ marginRight: '5px' }}
                        icon={formIcons.find(icon => icon.value === 'reference')?.icon || 'mdi:text-box-outline'}
                        width={23}
                        color={theme.palette.secondary.light}
                      />
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  fullWidth
                  label="Amount"
                  value={`${Number(expense.expenseDetails?.amount || 0).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
                  InputProps={{
                    readOnly: true,
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
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  fullWidth
                  label="Payment Mode"
                  value={expense.expenseDetails?.paymentMode || ''}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <Icon
                        style={{ marginRight: '5px' }}
                        icon={formIcons.find(icon => icon.value === 'payment')?.icon || 'mdi:credit-card-outline'}
                        width={23}
                        color={theme.palette.secondary.light}
                      />
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  fullWidth
                  label="Expense Date"
                  value={
                    expense.expenseDetails?.expenseDate
                      ? dayjs(expense.expenseDetails.expenseDate).format('DD/MM/YYYY')
                      : ''
                  }
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <Icon
                        style={{ marginRight: '5px' }}
                        icon={formIcons.find(icon => icon.value === 'date')?.icon || 'mdi:calendar-outline'}
                        width={23}
                        color={theme.palette.secondary.light}
                      />
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>

            </Grid>
          </Box>
        ) : (
          <Box className="flex justify-center items-center h-40">
            <Typography color="error">Expense not found</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions className="flex justify-center pbs-0 pbe-10 pli-10 sm:pbe-12 sm:pli-16">
        <Button color="secondary" variant="outlined" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ExpenseDialog = ({ mode, open, ...rest }) => {
  if (!open) return null;

  if (mode === 'view') {
    return <ExpenseViewDialog open={open} {...rest} />;
  }

  if (mode === 'add' || mode === 'edit') {
    return <ExpenseFormDialog mode={mode} open={open} {...rest} />;
  }

  return null;
};

export default ExpenseDialog;
