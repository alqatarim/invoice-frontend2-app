'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {

  Input,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  DialogTitle,
  CircularProgress,
  Snackbar,
  IconButton,
  FormHelperText,
} from '@mui/material';
import { QuestionMark, CheckCircle, Error, Close as CloseIcon, CloudUpload } from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import { updateProduct, generateSKU } from '@/app/(dashboard)/products/actions';
import Image from 'next/image';
import { Icon } from '@iconify/react';
// import questionmarkGif from '/images/animated-icons/question.gif'
const schema = yup.object().shape({
  name: yup.string().required('Product name is required'),
  type: yup.string().required('Product type is required'),
  sku: yup.string().required('SKU is required'),
  category: yup.object().shape({
    _id: yup.string().required('Category is required'),
  }),
  sellingPrice: yup.number()
    .required('Selling Price is required')
    .positive('Selling Price must be a positive number')
    .typeError('Enter a valid Selling Price')
    .test('is-greater', 'Selling Price must be greater than Purchase Price', function (value) {
      const purchasePrice = this.parent.purchasePrice;
      if (value && purchasePrice) {
        return value > purchasePrice;
      }
      return true;
    }),
  purchasePrice: yup.number()
    .required('Purchase Price is required')
    .positive('Purchase Price must be a positive number')
    .typeError('Enter a valid Purchase Price'),
  discountValue: yup.number()
    .required('Discount Value is required')
    .min(0, 'Discount Value must be non-negative')
    .typeError('Enter a valid Discount Value'),
  units: yup.object().shape({
    _id: yup.string().required('Unit is required'),
  }),
  discountType: yup.string().required('Discount Type is required'),
  alertQuantity: yup.number()
    .required('Alert Quantity is required')
    .typeError('Enter a valid Alert Quantity')
    .positive('Alert Quantity must be a positive number')
    .integer('Alert Quantity must be an integer'),
  tax: yup.object().shape({
    _id: yup.string().required('Tax is required'),
  }),
});

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

// Updated CustomTextField component
const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    height: '3rem', // Adjust this value to your desired height
  },
  '& .MuiInputBase-input': {
    padding: '0.5rem', // Adjust padding to vertically center the text
  },
  '& .MuiInputLabel-root': {
    lineHeight: '1rem', // Adjust line height for the label
    transform: 'translate(14px, 12px) scale(1)', // Adjust positioning of the label
  },
  '& .MuiInputLabel-shrink': {
    transform: 'translate(14px, -6px) scale(0.85)', // Increased scale from 0.75 to 0.85
  },
}));

// Updated Custom label component
const CustomInputLabel = styled(InputLabel)(({ theme }) => ({
  fontSize: '0.875rem', // Adjust font size as needed
  transform: 'translate(14px, 12px) scale(1)', // Initial position
  '&.MuiInputLabel-shrink': {
    transform: 'translate(14px, -6px) scale(0.85)', // Increased scale from 0.75 to 0.85
    fontSize: '1rem', // Slightly larger font size when shrunk
  },
}));

const EditProduct = ({ initialProductData, onSave }) => {
  const router = useRouter();
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccessOptions, setShowSuccessOptions] = useState(false);
  const [preparedData, setPreparedData] = useState(null);
  const [preparedImage, setPreparedImage] = useState(null);
  const [confirmationStatus, setConfirmationStatus] = useState({
    image: "/images/animated-icons/question.gif", // Use the path directly
    message: 'Are you sure you want to update this product?',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    status: 'loading'
  });
  const [files, setFiles] = useState([]);
  const [imgerror, setImgError] = useState("");
  const theme = useTheme();
  const [updatingMessage, setUpdatingMessage] = useState('Updating');
  const [dotCount, setDotCount] = useState(0);

  const { control, handleSubmit, setValue, watch, register, formState: { errors, dirtyFields, isValid } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ...initialProductData,
      category: initialProductData.category,
      units: initialProductData.units,
      tax: initialProductData.tax,
    },
    mode: 'onChange',
  });

  const watchedImages = watch("images");

  useEffect(() => {
    if (initialProductData) {
      Object.keys(initialProductData).forEach((key) => {
        setValue(key, initialProductData[key]);
      });
      setFiles(initialProductData.images ? [initialProductData.images] : []);
    }
  }, [initialProductData, setValue]);

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

  useEffect(() => {
    let interval;
    if (isUpdating) {
      interval = setInterval(() => {
        setDotCount((prevCount) => (prevCount + 1) % 6);
      }, 200); // Adjust this value to change the speed
    } else {
      setDotCount(0);
    }

    return () => clearInterval(interval);
  }, [isUpdating]);

  useEffect(() => {
    // Ensure the messages array is used directly without any trimming or alteration
    const messages = ["   ",".  ", ".. ", "...",".. ",".  "];
    const messageIndex = (dotCount % messages.length);
    setUpdatingMessage(`Updating${messages[messageIndex]}`);
  }, [dotCount]);

  const getSkuCode = async () => {
    try {
      const skuCode = await generateSKU();
      if (skuCode) {
        setValue("sku", skuCode);
      }
    } catch (error) {
      console.error("Error generating SKU:", error);
      setSnackbar({
        open: true,
        message: 'Failed to generate SKU',
        status: 'error'
      });
    }
  };




  const prepareFormData = (data) => {
    return {
      name: data.name,
      type: data.type,
      sku: data.sku,
      category: data.category._id,
      sellingPrice: data.sellingPrice,
      purchasePrice: data.purchasePrice,
      discountValue: data.discountValue,
      units: data.units._id,
      discountType: data.discountType,
      alertQuantity: data.alertQuantity,
      tax: data.tax._id,
      barcode: data.barcode,
      _id: initialProductData._id,
      // imageData: imageData
      //  images: imageData
     //  images: data.images && data.images[0] ? data.images[0] : undefined
    };
  };

  const prepareImageData = (data) => {
    return new Promise((resolve) => {
      if (data.images && data.images[0] instanceof File) {
        const file = data.images[0];
        const reader = new FileReader();
        reader.onloadend = () => {
          const imageData = {
            name: file.name,
            type: file.type,
            size: file.size,
            base64: reader.result
          };
          resolve(imageData);
        };
        reader.readAsDataURL(file);
      } else {
        resolve(null);
      }
    });
  };

  const onSubmit = async (data) => {
    const preparedData = prepareFormData(data);
    const imageData = await prepareImageData(data);
    setPreparedData(preparedData);
    setPreparedImage(imageData);
    setOpenConfirmDialog(true);
    setConfirmationStatus({
      image: "/images/animated-icons/question.gif",
      message: 'Are you sure you want to update?',
    });
  };

  const handleConfirmUpdate = async () => {
    setIsUpdating(true);

    // Update the message with the animated dots
    setConfirmationStatus({
      image: "/images/animated-icons/update.gif",
      message: updatingMessage,
    });

    const result = await new Promise((resolve) => {
      setTimeout(async () => {
        const updateResult = await updateProduct(preparedData, preparedImage);
        resolve(updateResult);
      }, 2000); // Simulate a delay for testing purposes
    });

    setIsUpdating(false);

    if (result.success) {
      setConfirmationStatus({
        image: "/images/animated-icons/success.gif",
        message: 'Product updated successfully!',
      });
      setShowSuccessOptions(true);
    } else {
      setConfirmationStatus({
        image: "/images/animated-icons/fail.gif",
        message: result.message || 'Failed to update product',
      });
    }
  };

  const handleContinueEditing = () => {
    setOpenConfirmDialog(false);
    setShowSuccessOptions(false); // Reset to show confirmation buttons next time
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const getFieldStatus = (fieldName) => {
    if (dirtyFields[fieldName]) {
      if (errors[fieldName]) {
        return 'error';
      } else {
        return 'success';
      }
    }
    return 'primary';
  };

  const onDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      setValue("images", files);
    }
  };

  const onDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <Card>
      <CardContent>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h5" gutterBottom>
            Edit Product
          </Typography>
          <Grid container spacing={2}>

            <Grid container item xs={12} spacing={6} sx={{ mb: 3 }}>

              <Grid item xs={12} sm={6} md={6} lg={4}>
                <Controller
                  name="type"
                  control={control}
                  rules={{ required: true }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomTextField
                      {...field}
                      select
                      fullWidth
                      variant="outlined"
                      error={!!error}
                      helperText={error?.message}
                      color={getFieldStatus('type')}
                      InputLabelProps={{
                        component: CustomInputLabel,
                      }}
                      label="Type"
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
                  rules={{ required: true }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      variant="outlined"
                      error={!!error}
                      helperText={error?.message}
                      color={getFieldStatus('name')}
                      InputLabelProps={{
                        component: CustomInputLabel,
                      }}
                      label="Product Name"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={4}>
                <Controller
                  name="sku"
                  control={control}
                  rules={{ required: true }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      variant="outlined"
                      error={!!errors.sku}
                      helperText={errors.sku?.message}
                      InputLabelProps={{
                        component: CustomInputLabel,
                      }}
                      label="SKU"
                      InputProps={{
                        endAdornment: (
                          <Button
                            onClick={getSkuCode}
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

            <Grid container item xs={12} spacing={6} sx={{ mb: 3 }} >
              <Grid item xs={12} sm={6} md={6} lg={4}>
                <Controller
                  name="category._id"
                  control={control}
                  rules={{ required: true }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomTextField
                      {...field}
                      select
                      fullWidth
                      variant="outlined"
                      error={!!error}
                      helperText={error?.message}
                      color={getFieldStatus('category._id')}
                      InputLabelProps={{
                        component: CustomInputLabel,
                      }}
                      label="Category"
                    >
                      <MenuItem value={initialProductData.category._id}>
                        {initialProductData.category.name}
                      </MenuItem>
                      {/* Add more categories here if available */}
                    </CustomTextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={4}>
                <Controller
                  name="sellingPrice"
                  control={control}
                  rules={{ required: true }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      variant="outlined"
                      error={!!error}
                      helperText={error?.message}
                      color={getFieldStatus('sellingPrice')}
                      InputLabelProps={{
                        component: CustomInputLabel,
                      }}
                      label="Selling Price"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={4}>
                <Controller
                  name="purchasePrice"
                  control={control}
                  rules={{ required: true }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      variant="outlined"
                      error={!!error}
                      helperText={error?.message}
                      color={getFieldStatus('purchasePrice')}
                      InputLabelProps={{
                        component: CustomInputLabel,
                      }}
                      label="Purchase Price"
                    />
                  )}
                />
              </Grid>


            </Grid>

            <Grid container item xs={12} spacing={6} sx={{ mb:3 }}>


              <Grid item xs={12} sm={6} md={6} lg={4}>
                <Controller
                  name="units._id"
                  control={control}
                  rules={{ required: true }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomTextField
                      {...field}
                      select
                      fullWidth
                      variant="outlined"
                      error={!!error}
                      helperText={error?.message}
                      value={field.value || ''}
                      color={getFieldStatus('units._id')}
                      InputLabelProps={{
                        component: CustomInputLabel,
                      }}
                      label="Units"
                    >
                      <MenuItem value={initialProductData.units._id}>
                        {initialProductData.units.name}
                      </MenuItem>
                      {/* Add more units here if available */}
                    </CustomTextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={4}>
                <Controller
                  name="discountType"
                  control={control}
                  rules={{ required: true }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      variant="outlined"
                      error={!!error}
                      helperText={error?.message}
                      color={getFieldStatus('discountType')}
                      InputLabelProps={{
                        component: CustomInputLabel,
                      }}
                      label="Discount Type"
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
                  rules={{ required: true }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      variant="outlined"
                      error={!!error}
                      helperText={error?.message}
                      color={getFieldStatus('discountValue')}
                      InputLabelProps={{
                        component: CustomInputLabel,
                      }}
                      label="Discount Value"
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Grid container item xs={12} spacing={6} sx={{ mb: 3 }} >

                <Grid item xs={12} sm={6} md={6} lg={4}>
                            <Controller
                              name="alertQuantity"
                              control={control}
                              rules={{ required: true }}
                              render={({ field, fieldState: { error } }) => (
                                <CustomTextField
                                  {...field}
                                  fullWidth
                                  variant="outlined"
                                  error={!!error}
                                  helperText={error?.message}
                                  color={getFieldStatus('alertQuantity')}
                                  InputLabelProps={{
                                    component: CustomInputLabel,
                                  }}
                                  label="Alert Quantity"
                                />
                              )}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} lg={4}>
                            <Controller
                              name="tax._id"
                              control={control}
                              rules={{ required: true }}
                              render={({ field, fieldState: { error } }) => (
                                <CustomTextField
                                  {...field}
                                  select
                                  fullWidth
                                  variant="outlined"
                                  error={!!error}
                                  helperText={error?.message}
                                  value={field.value || ''}
                                  color={getFieldStatus('tax._id')}
                                  InputLabelProps={{
                                    component: CustomInputLabel,
                                  }}
                                  label="Tax"
                                >
                                  <MenuItem value={initialProductData.tax._id}>
                                    {`${initialProductData.tax.name} (${initialProductData.tax.taxRate}%)`}
                                  </MenuItem>
                                  {/* Add more tax options here if available */}
                                </CustomTextField>
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
                onDragOver={onDragOver}
              >
                <Icon icon="line-md:upload-loop" width="100" height="100" style={{ color: theme.palette.primary.main }} />
                <input
                  type="file"
                  id="image_upload"
                  accept="image/*"
                  style={{ display: 'none' }}
                  {...register("images")}
                />
                <Typography>
                  Drop your files here or <span style={{ strokeWidth: '1', color: 'primary.main' }}>browse</span>
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Maximum size: 50MB
                </Typography>
              </Box>
              {files[0] && !imgerror && (
                <Box mt={2}>
                  <Image
                    src={files[0]}
                    alt="Uploaded product"
                    width={200}
                    height={200}
                    objectFit="contain"
                  />
                </Box>
              )}
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap:12}}>
                <Button
                className='pr-8 pl-8'
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!isValid}

                >
                  Update
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
            </Grid>
          </Grid>
        </Box>
      </CardContent>

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => !isUpdating && setOpenConfirmDialog(false)}
        PaperProps={{
          style: {
            minHeight: '300px', // Set a fixed minimum height
            minWidth: '400px',  // Change this value to your desired width
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
              {isUpdating ? updatingMessage : confirmationStatus.message}
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions className='flex flex-row justify-center gap-4'>
          {!isUpdating && (
            showSuccessOptions ? (
              <>
                <Button onClick={handleContinueEditing}>
                  Continue Editing
                </Button>
                <Link href="/products/product-list" passHref>
                  <Button component="a">Return to Product List</Button>
                </Link>
              </>
            ) : (
              <>
                <Button size='medium' className='pr-8 pl-8' variant="contained" onClick={handleConfirmUpdate} autoFocus>
                  Yes
                </Button>
                <Button size='medium' className='pr-8 pl-8' variant="outlined" color='secondary' onClick={() => setOpenConfirmDialog(false)}>
                  No
                </Button>
              </>
            )
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

export default EditProduct;

