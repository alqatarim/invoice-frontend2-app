'use client'

import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  Button,
  Typography,
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
import { useEditCustomerHandlers } from '@/handlers/customers/editCustomer'

const EditCustomer = ({ customerData, customerId }) => {
  const [imagePreview, setImagePreview] = useState(
    customerData?.image ? `${process.env.NEXT_PUBLIC_API_URL}/${customerData.image}` : null
  )
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  })

  // Permissions
  const canUpdate = usePermission('customer', 'update')

  // Notification handlers
  const onError = (msg) => setSnackbar({ open: true, message: msg, severity: 'error' })
  const onSuccess = (msg) => setSnackbar({ open: true, message: msg, severity: 'success' })

  // Initialize handlers
  const handlers = useEditCustomerHandlers({ 
    initialCustomer: customerData, 
    customerId, 
    onError, 
    onSuccess 
  })

  // Update image preview when existing image is loaded
  useEffect(() => {
    if (customerData?.image) {
      setImagePreview(`${process.env.NEXT_PUBLIC_API_URL}/${customerData.image}`)
    }
  }, [customerData])

  if (!canUpdate) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="error">
            You don't have permission to edit customers
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
    setImagePreview(customerData?.image ? `${process.env.NEXT_PUBLIC_API_URL}/${customerData.image}` : null)
  }

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <Card>
        <CardHeader
          title="Edit Customer"
          action={
            <Box display="flex" gap={2}>
              <Button variant="outlined" onClick={handlers.handleCancel}>
                Cancel
              </Button>
              <Button 
                variant="outlined" 
                onClick={handlers.handleSaveAndContinue}
                disabled={handlers.loading}
              >
                Save & Continue Editing
              </Button>
              <Button 
                variant="contained" 
                onClick={handlers.handleSubmit}
                disabled={handlers.loading}
                startIcon={handlers.loading && <CircularProgress size={20} />}
              >
                Update Customer
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
              <CardHeader title="Basic Information" />
              <CardContent>
                <Grid container spacing={3}>
                  {/* Profile Image */}
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        src={imagePreview}
                        sx={{ width: 80, height: 80 }}
                      >
                        <Icon icon="mdi:account" />
                      </Avatar>
                      <Box>
                        <input
                          accept="image/*"
                          type="file"
                          id="image-upload"
                          style={{ display: 'none' }}
                          onChange={handleImageChange}
                        />
                        <label htmlFor="image-upload">
                          <Button variant="outlined" component="span">
                            {imagePreview ? 'Change Image' : 'Upload Image'}
                          </Button>
                        </label>
                        {imagePreview && (
                          <IconButton onClick={handleRemoveImage} color="error">
                            <Icon icon="mdi:delete" />
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
              <CardHeader title="Billing Address" />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Contact Person"
                      value={handlers.formData.billingAddress.name}
                      onChange={(e) => handlers.handleNestedFieldChange('billingAddress', 'name', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Address Line 1"
                      value={handlers.formData.billingAddress.addressLine1}
                      onChange={(e) => handlers.handleNestedFieldChange('billingAddress', 'addressLine1', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Address Line 2"
                      value={handlers.formData.billingAddress.addressLine2}
                      onChange={(e) => handlers.handleNestedFieldChange('billingAddress', 'addressLine2', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="City"
                      value={handlers.formData.billingAddress.city}
                      onChange={(e) => handlers.handleNestedFieldChange('billingAddress', 'city', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="State"
                      value={handlers.formData.billingAddress.state}
                      onChange={(e) => handlers.handleNestedFieldChange('billingAddress', 'state', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Country"
                      value={handlers.formData.billingAddress.country}
                      onChange={(e) => handlers.handleNestedFieldChange('billingAddress', 'country', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Pincode"
                      value={handlers.formData.billingAddress.pincode}
                      onChange={(e) => handlers.handleNestedFieldChange('billingAddress', 'pincode', e.target.value)}
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
                title="Shipping Address"
                action={
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={JSON.stringify(handlers.formData.shippingAddress) === JSON.stringify(handlers.formData.billingAddress)}
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
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Contact Person"
                      value={handlers.formData.shippingAddress.name}
                      onChange={(e) => handlers.handleNestedFieldChange('shippingAddress', 'name', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Address Line 1"
                      value={handlers.formData.shippingAddress.addressLine1}
                      onChange={(e) => handlers.handleNestedFieldChange('shippingAddress', 'addressLine1', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Address Line 2"
                      value={handlers.formData.shippingAddress.addressLine2}
                      onChange={(e) => handlers.handleNestedFieldChange('shippingAddress', 'addressLine2', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="City"
                      value={handlers.formData.shippingAddress.city}
                      onChange={(e) => handlers.handleNestedFieldChange('shippingAddress', 'city', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="State"
                      value={handlers.formData.shippingAddress.state}
                      onChange={(e) => handlers.handleNestedFieldChange('shippingAddress', 'state', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Country"
                      value={handlers.formData.shippingAddress.country}
                      onChange={(e) => handlers.handleNestedFieldChange('shippingAddress', 'country', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Pincode"
                      value={handlers.formData.shippingAddress.pincode}
                      onChange={(e) => handlers.handleNestedFieldChange('shippingAddress', 'pincode', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Bank Details */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Bank Details (Optional)" />
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

export default EditCustomer