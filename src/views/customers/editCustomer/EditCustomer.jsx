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
  Divider
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Icon } from '@iconify/react'
import { usePermission } from '@/Auth/usePermission'
import { useEditCustomerHandlers } from '@/handlers/customers/editCustomer'

const EditCustomer = ({ customerData, customerId }) => {
  const theme = useTheme()
  
  // Extract customer data from the correct structure
  const customer = customerData?.customerDetails?.[0] || customerData?.customer || customerData
  
  const [imagePreview, setImagePreview] = useState(
    customer?.image ? `${process.env.NEXT_PUBLIC_API_URL}/${customer.image}` : null
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
    initialCustomer: customer, 
    customerId, 
    onError, 
    onSuccess 
  })

  // Update image preview when existing image is loaded
  useEffect(() => {
    if (customer?.image) {
      setImagePreview(`${process.env.NEXT_PUBLIC_API_URL}/${customer.image}`)
    }
  }, [customer])

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
    setImagePreview(customer?.image ? `${process.env.NEXT_PUBLIC_API_URL}/${customer.image}` : null)
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
              <Typography variant="h5">Edit Customer</Typography>
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
                startIcon={<i className='ri-edit-line' />}
              >
                Save & Continue Editing
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handlers.handleSubmit}
                disabled={handlers.loading}
                startIcon={handlers.loading ? <CircularProgress size={20} /> : <i className='ri-check-line' />}
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
              <CardHeader 
                title={
                  <Typography variant="h6" className="font-medium">
                    Basic Information
                  </Typography>
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={4}>
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
                            {imagePreview ? 'Change Image' : 'Upload Image'}
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

                  {/* Name and Email */}
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

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      required
                      value={handlers.formData.email}
                      onChange={(e) => handlers.handleFieldChange('email', e.target.value)}
                      onBlur={() => handlers.handleFieldBlur('email')}
                      error={handlers.touched.email && !!handlers.errors.email}
                      helperText={handlers.touched.email && handlers.errors.email}
                    />
                  </Grid>

                  {/* Phone and Website */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      required
                      value={handlers.formData.phone}
                      onChange={(e) => handlers.handleFieldChange('phone', e.target.value)}
                      onBlur={() => handlers.handleFieldBlur('phone')}
                      error={handlers.touched.phone && !!handlers.errors.phone}
                      helperText={handlers.touched.phone && handlers.errors.phone}
                    />
                  </Grid>

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
                      placeholder="Add any additional notes about this customer..."
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Address Information */}
          <Grid item xs={12}>
            <Card>
              <CardHeader 
                title={
                  <Typography variant="h6" className="font-medium">
                    Address Information
                  </Typography>
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={4}>
                  {/* Billing Address Section */}
                  <Grid item xs={12}>
                    <Typography variant="h6" className="font-medium">
                      Billing Address
                    </Typography>
                    <Divider className="mt-2 mb-4" />
                  </Grid>
                  
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

                  <Grid item xs={12}>
                    <Divider />
                  </Grid>

                  {/* Shipping Address Section */}
                  <Grid item xs={12}>
                    <div className="flex items-center justify-between">
                      <Typography variant="h6" className="font-medium">
                        Shipping Address
                      </Typography>
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
                    </div>
                    <Divider className="mt-2 mb-4" />
                  </Grid>

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
              <CardHeader 
                title={
                  <Typography variant="h6" className="font-medium">
                    Bank Details
                  </Typography>
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={4}>
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

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="end" gap={2}>
                  <Button 
                    variant="outlined" 
                    onClick={handlers.handleCancel}
                    startIcon={<Icon icon="tabler:x" />}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={handlers.handleSaveAndContinue}
                    disabled={handlers.loading}
                    startIcon={<Icon icon="tabler:device-floppy" />}
                  >
                    Save & Continue Editing
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handlers.handleSubmit}
                    disabled={handlers.loading}
                    startIcon={handlers.loading ? <CircularProgress size={18} /> : <Icon icon="tabler:check" />}
                  >
                    {handlers.loading ? 'Updating...' : 'Update Customer'}
                  </Button>
                </Box>
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