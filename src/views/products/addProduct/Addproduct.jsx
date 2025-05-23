'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { QuestionMark, CheckCircle, Error, Close as CloseIcon, CloudUpload } from '@mui/icons-material';
import {
  CircularProgress,
    Snackbar,
  TextField,
  Select,
  MenuItem,
  Button,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  IconButton,
  FormHelperText,
  InputLabel,
  FormControl,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { generateSKU } from '@/app/(dashboard)/products/actions';
import useAuthRedirect from '@/Auth/useAuthRedirect';
import AddProductSchema from '@/views/products/addProduct/AddProductSchema';

// Styled components
const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    height: '3rem',
  },
  '& .MuiInputBase-input': {
    padding: '0.5rem',
  },
}));

const CustomInputLabel = styled(InputLabel)(({ theme }) => ({
  fontSize: '0.875rem',
  transform: 'translate(14px, 12px) scale(1)',
  '&.MuiInputLabel-shrink': {
    transform: 'translate(14px, -6px) scale(0.85)',
    fontSize: '1rem',
  },
}));

const AddProduct = ({ onSave, dropdownData }) => {
    const { handleAuthError } = useAuthRedirect();
  const router = useRouter();
  const theme = useTheme();
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
  const [showSuccessOptions, setShowSuccessOptions] = useState(false);
  const [files, setFiles] = useState([]);
  const [confirmationStatus, setConfirmationStatus] = useState({
    image: "/images/animated-icons/question.gif",
    message: 'Are you sure you want to add this product?',
    isInitialConfirmation: true,
    isCompleted: false
  });
  const [updatingMessage, setUpdatingMessage] = useState('Adding');
  const [dotCount, setDotCount] = useState(0);

   const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    status: 'loading'
  });

  const [touchedFields, setTouchedFields] = useState({});
  const [validFields, setValidFields] = useState({});

  const [preparedData, setPreparedData] = useState(null);
  const [preparedImage, setPreparedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imgerror, setImgError] = useState("");

  const StyledSnackbar = styled(Snackbar)(({ theme, status }) => ({
    '& .MuiSnackbarContent-root': {
      backgroundColor:
        status === 'success'
          ? theme.palette.success.main
          : status === 'error'
            ? theme.palette.error.main
            : theme.palette.primary.main,
      color: theme.palette.common.white,
      display: 'flex',
      alignItems: 'center',
    },
  }));



  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };


  const { control, handleSubmit, setValue, watch, formState: { errors, isValid }, register } = useForm({
    resolver: yupResolver(AddProductSchema),
    defaultValues: {
      type: 'product',
      discountType: '2',
      discountValue: 0,
      alertQuantity: 0,
      images: []
    },
    mode: 'onBlur',
    reValidateMode: 'onChange'
  });

  const watchedImages = watch("images");

  useEffect(() => {
    if (watchedImages && watchedImages.length > 0) {
      const file = watchedImages[0];
      if (file instanceof File) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFiles([reader.result]);
        };
        reader.readAsDataURL(file);
      }
    }
  }, [watchedImages]);

  useEffect(() => {
    let interval;
    if (isSubmitting) {
      interval = setInterval(() => {
        setDotCount((prevCount) => (prevCount + 1) % 6);
      }, 200);
    } else {
      setDotCount(0);
    }
    return () => clearInterval(interval);
  }, [isSubmitting]);

  useEffect(() => {
    const messages = ["   ",".  ", ".. ", "...",".. ",".  "];
    const messageIndex = (dotCount % messages.length);
    setUpdatingMessage(`Adding${messages[messageIndex]}`);
  }, [dotCount]);

  useEffect(() => {
    if (imgerror) {
      setSnackbar({
        open: true,
        message: imgerror,
        status: 'error'
      });
      setValue("images", null);
      setImgError("");
    }
  }, [imgerror, setValue]);





  const handleGetSKU = async () => {
    try {
      const response = await generateSKU();

      // Check for auth errors
      const { isAuthError, snackbarData } = handleAuthError(response, '/products/addProduct');
      if (isAuthError) {
        setSnackbar(snackbarData);
        return;
      }

      setValue("sku", response.data, { shouldValidate: true, shouldDirty: true, shouldTouch: true });

    } catch (error) {
      console.error("Error generating SKU:", error);
      setSnackbar({
        open: true,
        message: 'Failed to generate SKU',
        status: 'error'
      });
    }
  };

  const onSubmit = async (data) => {
    const preparedData = {
      name: data.name,
      type: data.type,
      sku: data.sku,
      category: data.category._id,
      sellingPrice: data.sellingPrice,
      purchasePrice: data.purchasePrice,
      units: data.units._id,
      discountType: data.discountType,
      discountValue: data.discountValue,
      alertQuantity: data.alertQuantity,
      tax: data.tax._id,
    };

    let preparedImage = null;
    if (imageFile) {
      preparedImage = {
        name: imageFile.name,
        type: imageFile.type,
        size: imageFile.size,
        base64: files[0] // This is the base64 string from the FileReader
      };
    }

    setPreparedData(preparedData);
    setPreparedImage(preparedImage);
    setOpenConfirmDialog(true);
    setConfirmationStatus({
      image: "/images/animated-icons/question.gif",
      message: 'Are you sure you want to add this product?',
      isInitialConfirmation: true,
      isCompleted: false
    });
  };

  const handleConfirmAdd = async () => {
    setIsSubmitting(true);
    setConfirmationStatus({
      image: "/images/animated-icons/update.gif",
      message: updatingMessage,
      isInitialConfirmation: false,
      isCompleted: false
    });

    try {
      const result = await onSave(preparedData, preparedImage);
      setIsSubmitting(false);

      if (result.success) {
        setConfirmationStatus({
          image: "/images/animated-icons/success.gif",
          message: 'Product added successfully!',
          isInitialConfirmation: false,
          isCompleted: true
        });
      } else {
        setConfirmationStatus({
          image: "/images/animated-icons/fail.gif",
          message: result.message || 'Failed to add product',
          isInitialConfirmation: false,
          isCompleted: true
        });
      }
    } catch (error) {
      setIsSubmitting(false);
      setConfirmationStatus({
        image: "/images/animated-icons/fail.gif",
        message: 'An error occurred while adding the product.',
        isInitialConfirmation: false,
        isCompleted: true
      });
    }
  };

  const handleContinueEditing = () => {
    setOpenConfirmDialog(false);
    setShowSuccessOptions(false);
  };

  const handleCancel = () => {
    router.back();
  };

  const onFieldChange = (fieldName, value) => {
    try {
      // Validate single field using yup
      AddProductSchema.validateAt(fieldName, { [fieldName]: value })
        .then(() => {
          setValidFields(prev => ({ ...prev, [fieldName]: true }));
        })
        .catch(() => {
          setValidFields(prev => ({ ...prev, [fieldName]: false }));
        });
    } catch (error) {
      setValidFields(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleFileSelection = (file) => {
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 50 * 1024 * 1024; // 50MB

      if (!validTypes.includes(file.type)) {
        setImgError('Please upload a valid image file (JPEG, PNG, or GIF)');
        const fileInput = document.getElementById('image_upload');
        if (fileInput) fileInput.value = '';
        return;
      }

      if (file.size > maxSize) {
        setImgError('File size must be less than 50MB');
        const fileInput = document.getElementById('image_upload');
        if (fileInput) fileInput.value = '';
        return;
      }

      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFiles([reader.result]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (event) => {
    const file = event.target.files[0];
    handleFileSelection(file);
  };

  const onDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.files;
    handleFileSelection(files[0]);
  };

  return (
    <Card>
      <CardContent>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
          <Typography variant="h5" gutterBottom>
            Add Product
          </Typography>

          <Grid container spacing={2}>
            <Grid container item xs={12} spacing={6} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={6} lg={4}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      select
                      fullWidth
                      label="Type"
                      error={!!errors.type}
                      helperText={errors.type?.message}
                      InputLabelProps={{
                        component: CustomInputLabel,
                      }}
                    >
                      <MenuItem value="product">Product</MenuItem>
                      <MenuItem value="service">Service</MenuItem>
                    </CustomTextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6} lg={4}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Product Name"
                      error={!!errors.name}
                      color={validFields[field.name] ? 'success' : 'primary'}
                      helperText={errors.name?.message}
                      InputLabelProps={{
                        shrink: true
                      }}
                      onChange={(e) => {
                        field.onChange(e);
                        onFieldChange('name', e.target.value);
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6} lg={4}>
                <Controller
                  name="sku"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label="SKU"
                      error={!!errors.sku}
                      color={validFields[field.name] ? 'success' : 'primary'}
                      helperText={errors.sku?.message}
                      InputLabelProps={{
                        component: CustomInputLabel,
                        shrink: !!field.value,
                      }}
                      onChange={(e) => {
                        field.onChange(e);
                        onFieldChange('sku', e.target.value);
                      }}
                      InputProps={{
                        endAdornment: (
                          <Button
                            onClick={handleGetSKU}
                            sx={{ whiteSpace: 'nowrap' }}
                          >
                            Generate SKU
                          </Button>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Grid container item xs={12} spacing={6} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={6} lg={4}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Category"
                      error={!!errors.category?._id}
                      color={validFields['category._id'] ? 'success' : 'primary'}
                      helperText={errors.category?._id?.message}
                      InputLabelProps={{
                        shrink: true
                      }}
                      onChange={(e) => {
                        field.onChange(e);
                        onFieldChange('category._id', e.target.value._id);
                      }}
                    >
                      {dropdownData.categories.map((category) => (
                        <MenuItem key={category._id} value={category}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6} lg={4}>
                <Controller
                  name="sellingPrice"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label="Selling Priceeeeee"
                      type="number"
                      error={!!errors.sellingPrice}
                      helperText={errors.sellingPrice?.message}
                      InputLabelProps={{
                        component: CustomInputLabel,
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6} lg={4}>
                <Controller
                  name="purchasePrice"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label="Purchase Price"
                      type="number"
                      error={!!errors.purchasePrice}
                      helperText={errors.purchasePrice?.message}
                      InputLabelProps={{
                        component: CustomInputLabel,
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Grid container item xs={12} spacing={6} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={6} lg={4}>
                <Controller
                  name="units"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.units}>
                      <CustomTextField
                        {...field}
                        select
                        fullWidth
                        label="Units"
                        error={!!errors.units}
                        helperText={errors.units?.message}
                        InputLabelProps={{
                          component: CustomInputLabel,
                        }}
                      >
                        {dropdownData.units.map((unit) => (
                          <MenuItem key={unit._id} value={unit}>
                            {unit.name}
                          </MenuItem>
                        ))}
                      </CustomTextField>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6} lg={4}>
                <Controller
                  name="discountType"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      select
                      fullWidth
                      label="Discount Type"
                      error={!!errors.discountType}
                      helperText={errors.discountType?.message}
                      InputLabelProps={{
                        component: CustomInputLabel,
                      }}
                    >
                      <MenuItem value="2">Percentage</MenuItem>
                      <MenuItem value="3">Fixed</MenuItem>
                    </CustomTextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6} lg={4}>
                <Controller
                  name="discountValue"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label="Discount Value"
                      type="number"
                      error={!!errors.discountValue}
                      helperText={errors.discountValue?.message}
                      InputLabelProps={{
                        component: CustomInputLabel,
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Grid container item xs={12} spacing={6} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={6} lg={4}>
                <Controller
                  name="alertQuantity"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label="Alert Quantity"
                      type="number"
                      error={!!errors.alertQuantity}
                      helperText={errors.alertQuantity?.message}
                      InputLabelProps={{
                        component: CustomInputLabel,
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6} lg={4}>
                <Controller
                  name="tax"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.tax}>
                      <CustomTextField
                        {...field}
                        select
                        fullWidth
                        label="Tax"
                        error={!!errors.tax}
                        helperText={errors.tax?.message}
                        InputLabelProps={{
                          component: CustomInputLabel,
                        }}
                      >
                        {dropdownData.taxes.map((tax) => (
                          <MenuItem key={tax._id} value={tax}>
                            {`${tax.name} (${tax.taxRate}%)`}
                          </MenuItem>
                        ))}
                      </CustomTextField>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>

            {/* Image Upload Component */}
            <Grid item xs={4} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Product Image
              </Typography>
              <Box
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: '4px',
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  },
                }}
                onClick={() => document.getElementById('image_upload').click()}
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <input
                  type="file"
                  id="image_upload"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileInput}
                />
                <Icon
                  icon="line-md:upload-loop"
                  width="100"
                  height="100"
                  style={{ color: theme.palette.primary.main }}
                />
                <Typography>
                  Drop your files here or <span style={{ color: theme.palette.primary.main }}>browse</span>
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Maximum size: 50MB
                </Typography>
                {files[0] && !imgerror && (
                  <Box mt={2}>
                    <Image
                      src={files[0]}
                      alt="Product preview"
                      width={200}
                      height={200}
                      objectFit="contain"
                    />
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 12 }}>
            <Button
              className='pr-8 pl-8'
              type="submit"
              variant="contained"
              color="primary"
              disabled={!isValid}
            >
              Add Product
            </Button>
            <Button
              className='pr-8 pl-8'
              variant="outlined"
              color="secondary"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </CardContent>

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => !isSubmitting && setOpenConfirmDialog(false)}
        PaperProps={{
          style: {
            minHeight: '300px',
            minWidth: '400px',
          },
        }}
      >
        <DialogContent className="flex flex-col items-center justify-between">
          <Image
            src={confirmationStatus.image}
            alt="Confirmation GIF"
            width={150}
            height={150}
            unoptimized={true}
          />
          <DialogContentText>
            <Typography
              variant="h5"
              sx={{ whiteSpace: 'pre-wrap' }}
            >
              {isSubmitting ? updatingMessage : confirmationStatus.message}
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions className='flex flex-row justify-center gap-4'>
          {confirmationStatus.isInitialConfirmation && !isSubmitting && (
            <>
              <Button
                size='medium'
                className='pr-8 pl-8'
                variant="contained"
                onClick={handleConfirmAdd}
                autoFocus
              >
                Yes
              </Button>
              <Button
                size='medium'
                className='pr-8 pl-8'
                variant="outlined"
                color='secondary'
                onClick={() => setOpenConfirmDialog(false)}
              >
                No
              </Button>
            </>
          )}

          {confirmationStatus.isCompleted && !isSubmitting && (
            <>
              <Button onClick={() => {
                setOpenConfirmDialog(false);
                setConfirmationStatus(prev => ({
                  ...prev,
                  isInitialConfirmation: true,
                  isCompleted: false
                }));
              }}>
                Continue editing
              </Button>
              <Link href="/products/product-list" passHref>
                <Button component="a">Go to Product List</Button>
              </Link>
            </>
          )}
        </DialogActions>
      </Dialog>


      <StyledSnackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {snackbar.status === 'loading' && <CircularProgress size={24} color="inherit" style={{ marginRight: 10 }} />}
            {snackbar.status === 'success' && <CheckCircle style={{ marginRight: 10 }} />}
            {snackbar.status === 'error' && <Error style={{ marginRight: 10 }} />}
            {snackbar.message}
          </span>
        }
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleCloseSnackbar}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
        status={snackbar.status}
      />

    </Card>
  );
};

export default AddProduct;
