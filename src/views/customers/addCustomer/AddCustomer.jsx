'use client'

import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  Button,
  Typography,
  Divider,
  FormControlLabel,
  Checkbox,
  Box,
  Avatar,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { Icon } from '@iconify/react'
import { usePermission } from '@/Auth/usePermission'
import { useAddCustomerHandlers } from '@/handlers/customers/addCustomer'

const AddCustomer = () => {
  const [imagePreview, setImagePreview] = useState(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  })

  // Permissions
  const canCreate = usePermission('customer', 'create')

  // Notification handlers
  const onError = (msg) => setSnackbar({ open: true, message: msg, severity: 'error' })
  const onSuccess = (msg) => setSnackbar({ open: true, message: msg, severity: 'success' })

  // Initialize handlers
  const handlers = useAddCustomerHandlers({ onError, onSuccess })

  if (!canCreate) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="error">
            You don't have permission to add customers
          </Typography>
        </CardContent>
      </Card>
    )
  }

  const handleImageChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      handlers.handleFileChange(file)
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    handlers.handleFileChange(null)
    setImagePreview(null)
  }

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Typography variant="h5">Add Customer</Typography>
            </div>
          }
          action={
            <Box display="flex" gap={2}>
              <Button 
                variant="outlined" 
                color="secondary"
                onClick={handlers.handleCancel}
                startIcon={<i className='ri-close-line' />}
              >
                Cancel
              </Button>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={handlers.handleSaveAndContinue}
                disabled={handlers.loading}
                startIcon={<i className='ri-add-line' />}
              >
                Save & Add Another
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handlers.handleSubmit}
                disabled={handlers.loading}
                startIcon={handlers.loading ? <CircularProgress size={20} /> : <i className='ri-check-line' />}
              >
                Save Customer
              </Button>
            </Box>
          }
        />
      </Card>

      {/* Form */}
      <form onSubmit={handlers.handleSubmit}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Card>
              <CardHeader 
                title={
                  <Typography variant="h6" className="font-medium">
                    Basic Information
                  </Typography>
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  {/* Profile Image */}
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={3}>
                      <Avatar
                        src={imagePreview}
                        sx={{ width: 100, height: 100 }}
                      >
                        <i className='ri-user-line text-4xl' />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary" className="mb-2">
                          Profile Picture
                        </Typography>
                        <input
                          accept="image/*"
                          type="file"
                          id="image-upload"
                          style={{ display: 'none' }}
                          onChange={handleImageChange}
                        />
                        <label htmlFor="image-upload">
                          <Button 
                            variant="outlined" 
                            component="span"
                            size="small"
                            startIcon={<i className='ri-upload-2-line' />}
                          >
                            Upload Image
                          </Button>
                        </label>
                        {imagePreview && (
                          <IconButton 
                            onClick={handleRemoveImage} 
                            color="error"
                            size="small"
                            className="ml-2"
                          >
                            <i className='ri-delete-bin-line' />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  </Grid>

                  {/* Name */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Customer Name *"
                      value={handlers.formData.name}
                      onChange={(e) => handlers.handleFieldChange('name', e.target.value)}
                      onBlur={() => handlers.handleFieldBlur('name')}
                      error={handlers.touched.name && !!handlers.errors.name}
                      helperText={handlers.touched.name && handlers.errors.name}
                      inputProps={{ maxLength: 50 }}
                    />
                  </Grid>

                  {/* Email */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email *"
                      type="email"
                      value={handlers.formData.email}
                      onChange={(e) => handlers.handleFieldChange('email', e.target.value)}
                      onBlur={() => handlers.handleFieldBlur('email')}
                      error={handlers.touched.email && !!handlers.errors.email}
                      helperText={handlers.touched.email && handlers.errors.email}
                    />
                  </Grid>

                  {/* Phone */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone *"
                      value={handlers.formData.phone}
                      onChange={(e) => handlers.handleFieldChange('phone', e.target.value)}
                      onBlur={() => handlers.handleFieldBlur('phone')}
                      error={handlers.touched.phone && !!handlers.errors.phone}
                      helperText={handlers.touched.phone && handlers.errors.phone}
                    />
                  </Grid>

                  {/* Website */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Website"
                      value={handlers.formData.website}
                      onChange={(e) => handlers.handleFieldChange('website', e.target.value)}
                    />
                  </Grid>

                  {/* Status */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={handlers.formData.status}
                        label="Status"
                        onChange={(e) => handlers.handleFieldChange('status', e.target.value)}
                      >
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Deactive">Inactive</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Notes */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notes"
                      multiline
                      rows={3}
                      value={handlers.formData.notes}
                      onChange={(e) => handlers.handleFieldChange('notes', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Billing Address */}
          <Grid item xs={12}>
            <Card>
              <CardHeader 
                title={
                  <Typography variant="h6" className="font-medium">
                    Billing Address
                  </Typography>
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Contact Person *"
                      value={handlers.formData.billingAddress.name}
                      onChange={(e) => handlers.handleNestedFieldChange('billingAddress', 'name', e.target.value)}
                      onBlur={() => handlers.handleFieldBlur('billingAddress.name')}
                      error={!!handlers.errors['billingAddress.name']}
                      helperText={handlers.errors['billingAddress.name']}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Address Line 1 *"
                      value={handlers.formData.billingAddress.addressLine1}
                      onChange={(e) => handlers.handleNestedFieldChange('billingAddress', 'addressLine1', e.target.value)}
                      onBlur={() => handlers.handleFieldBlur('billingAddress.addressLine1')}
                      error={!!handlers.errors['billingAddress.addressLine1']}
                      helperText={handlers.errors['billingAddress.addressLine1']}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Address Line 2 *"
                      value={handlers.formData.billingAddress.addressLine2}
                      onChange={(e) => handlers.handleNestedFieldChange('billingAddress', 'addressLine2', e.target.value)}
                      onBlur={() => handlers.handleFieldBlur('billingAddress.addressLine2')}
                      error={!!handlers.errors['billingAddress.addressLine2']}
                      helperText={handlers.errors['billingAddress.addressLine2']}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="City *"
                      value={handlers.formData.billingAddress.city}
                      onChange={(e) => handlers.handleNestedFieldChange('billingAddress', 'city', e.target.value)}
                      onBlur={() => handlers.handleFieldBlur('billingAddress.city')}
                      error={!!handlers.errors['billingAddress.city']}
                      helperText={handlers.errors['billingAddress.city']}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="State *"
                      value={handlers.formData.billingAddress.state}
                      onChange={(e) => handlers.handleNestedFieldChange('billingAddress', 'state', e.target.value)}
                      onBlur={() => handlers.handleFieldBlur('billingAddress.state')}
                      error={!!handlers.errors['billingAddress.state']}
                      helperText={handlers.errors['billingAddress.state']}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Country *"
                      value={handlers.formData.billingAddress.country}
                      onChange={(e) => handlers.handleNestedFieldChange('billingAddress', 'country', e.target.value)}
                      onBlur={() => handlers.handleFieldBlur('billingAddress.country')}
                      error={!!handlers.errors['billingAddress.country']}
                      helperText={handlers.errors['billingAddress.country']}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Pincode *"
                      value={handlers.formData.billingAddress.pincode}
                      onChange={(e) => handlers.handleNestedFieldChange('billingAddress', 'pincode', e.target.value)}
                      onBlur={() => handlers.handleFieldBlur('billingAddress.pincode')}
                      error={!!handlers.errors['billingAddress.pincode']}
                      helperText={handlers.errors['billingAddress.pincode']}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Shipping Address */}
          <Grid item xs={12}>
            <Card>
              <CardHeader 
                title={
                  <Typography variant="h6" className="font-medium">
                    Shipping Address
                  </Typography>
                }
                action={
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={handlers.formData.shippingAddress.name === handlers.formData.billingAddress.name}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handlers.handleCopyBillingToShipping()
                          }
                        }}
                      />
                    }
                    label="Same as billing address"
                  />
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Contact Person *"
                      value={handlers.formData.shippingAddress.name}
                      onChange={(e) => handlers.handleNestedFieldChange('shippingAddress', 'name', e.target.value)}
                      onBlur={() => handlers.handleFieldBlur('shippingAddress.name')}
                      error={!!handlers.errors['shippingAddress.name']}
                      helperText={handlers.errors['shippingAddress.name']}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Address Line 1 *"
                      value={handlers.formData.shippingAddress.addressLine1}
                      onChange={(e) => handlers.handleNestedFieldChange('shippingAddress', 'addressLine1', e.target.value)}
                      onBlur={() => handlers.handleFieldBlur('shippingAddress.addressLine1')}
                      error={!!handlers.errors['shippingAddress.addressLine1']}
                      helperText={handlers.errors['shippingAddress.addressLine1']}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Address Line 2 *"
                      value={handlers.formData.shippingAddress.addressLine2}
                      onChange={(e) => handlers.handleNestedFieldChange('shippingAddress', 'addressLine2', e.target.value)}
                      onBlur={() => handlers.handleFieldBlur('shippingAddress.addressLine2')}
                      error={!!handlers.errors['shippingAddress.addressLine2']}
                      helperText={handlers.errors['shippingAddress.addressLine2']}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="City *"
                      value={handlers.formData.shippingAddress.city}
                      onChange={(e) => handlers.handleNestedFieldChange('shippingAddress', 'city', e.target.value)}
                      onBlur={() => handlers.handleFieldBlur('shippingAddress.city')}
                      error={!!handlers.errors['shippingAddress.city']}
                      helperText={handlers.errors['shippingAddress.city']}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="State *"
                      value={handlers.formData.shippingAddress.state}
                      onChange={(e) => handlers.handleNestedFieldChange('shippingAddress', 'state', e.target.value)}
                      onBlur={() => handlers.handleFieldBlur('shippingAddress.state')}
                      error={!!handlers.errors['shippingAddress.state']}
                      helperText={handlers.errors['shippingAddress.state']}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Country *"
                      value={handlers.formData.shippingAddress.country}
                      onChange={(e) => handlers.handleNestedFieldChange('shippingAddress', 'country', e.target.value)}
                      onBlur={() => handlers.handleFieldBlur('shippingAddress.country')}
                      error={!!handlers.errors['shippingAddress.country']}
                      helperText={handlers.errors['shippingAddress.country']}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Pincode *"
                      value={handlers.formData.shippingAddress.pincode}
                      onChange={(e) => handlers.handleNestedFieldChange('shippingAddress', 'pincode', e.target.value)}
                      onBlur={() => handlers.handleFieldBlur('shippingAddress.pincode')}
                      error={!!handlers.errors['shippingAddress.pincode']}
                      helperText={handlers.errors['shippingAddress.pincode']}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Bank Details */}
          <Grid item xs={12}>
            <Card>
              <CardHeader 
                title={
                  <Typography variant="h6" className="font-medium">
                    Bank Details (Optional)
                  </Typography>
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Bank Name"
                      value={handlers.formData.bankDetails.bankName}
                      onChange={(e) => handlers.handleNestedFieldChange('bankDetails', 'bankName', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Branch"
                      value={handlers.formData.bankDetails.branch}
                      onChange={(e) => handlers.handleNestedFieldChange('bankDetails', 'branch', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Account Holder Name"
                      value={handlers.formData.bankDetails.accountHolderName}
                      onChange={(e) => handlers.handleNestedFieldChange('bankDetails', 'accountHolderName', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Account Number"
                      value={handlers.formData.bankDetails.accountNumber}
                      onChange={(e) => handlers.handleNestedFieldChange('bankDetails', 'accountNumber', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="IFSC Code"
                      value={handlers.formData.bankDetails.IFSC}
                      onChange={(e) => handlers.handleNestedFieldChange('bankDetails', 'IFSC', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} className="w-full">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default AddCustomer