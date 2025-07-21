'use client'

// React Imports
import { useState, useEffect, useCallback } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'

// Third-party Imports
import { useSnackbar } from 'notistack'

// Actions Import
import { updateCustomer } from '@/app/(dashboard)/customers/actions'

// Vars
const countries = ['US', 'France', 'Russia', 'China', 'UK', 'Germany', 'Italy', 'Japan', 'Australia', 'Canada', 'Saudi Arabia', 'UAE']

const EditAddressDialog = ({ open, setOpen, customer, addressType, onSuccess }) => {
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [copyToBilling, setCopyToBilling] = useState(false)

  // Form state for address fields
  const [formData, setFormData] = useState({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'US'
  })

  // Initialize form data when dialog opens or customer changes
  useEffect(() => {
    if (open && customer) {
      const addressData = addressType === 'billing'
        ? customer.billingAddress
        : customer.shippingAddress

      setFormData({
        name: addressData?.name || customer?.name || '',
        addressLine1: addressData?.addressLine1 || '',
        addressLine2: addressData?.addressLine2 || '',
        city: addressData?.city || '',
        state: addressData?.state || '',
        pincode: addressData?.pincode || '',
        country: addressData?.country || 'US'
      })
      setErrors({})
      setCopyToBilling(false)
    }
  }, [open, customer, addressType])

  // Validation function
  const validateForm = useCallback(() => {
    const newErrors = {}

    // Required fields validation
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.addressLine1?.trim()) {
      newErrors.addressLine1 = 'Address line 1 is required'
    }

    if (!formData.city?.trim()) {
      newErrors.city = 'City is required'
    }

    if (!formData.state?.trim()) {
      newErrors.state = 'State is required'
    }

    if (!formData.pincode?.trim()) {
      newErrors.pincode = 'Postal/ZIP code is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // Handle field changes
  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }, [errors])

  // Handle form submission
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault()

    if (!validateForm()) {
      enqueueSnackbar('Please fix the validation errors before submitting', { variant: 'error' })
      return
    }

    if (!customer?._id) {
      enqueueSnackbar('Customer ID is missing', { variant: 'error' })
      return
    }

    setLoading(true)
    enqueueSnackbar(`Updating ${addressType} address...`, { variant: 'info' })

    try {
      // Prepare complete customer data - include ALL existing fields plus the edited address
      const updateData = {
        // Include all existing customer data
        ...customer,

        // Update the specific address type
        [addressType === 'billing' ? 'billingAddress' : 'shippingAddress']: formData
      }

      // If copying shipping to billing, also update billing address
      if (addressType === 'shipping' && copyToBilling) {
        updateData.billingAddress = formData
      }


      // Call the update API
      const result = await updateCustomer(customer._id, updateData)

      if (result.success) {
        const message = copyToBilling && addressType === 'shipping'
          ? 'Shipping address updated and copied to billing address!'
          : `${addressType.charAt(0).toUpperCase() + addressType.slice(1)} address updated successfully!`

        enqueueSnackbar(message, { variant: 'success' })

        // Call success callback if provided
        if (onSuccess) {
          onSuccess(result.data)
        }

      } else {
        enqueueSnackbar(result.message || 'Failed to update address', { variant: 'error' })
      }
    } catch (error) {
      console.error('Error updating address:', error)
      enqueueSnackbar(error.message || 'An error occurred while updating the address', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [formData, validateForm, customer, addressType, copyToBilling, enqueueSnackbar, onSuccess])

  // Handle dialog close
  const handleClose = useCallback(() => {
    if (!loading) {
      setOpen(false)
      setErrors({})
    }
  }, [loading, setOpen])

  const dialogTitle = addressType === 'billing' ? 'Edit Billing Address' : 'Edit Shipping Address'
  const dialogDescription = addressType === 'billing'
    ? 'Update the billing address information for this customer.'
    : 'Update the shipping address information for this customer.'

  return (
    <Dialog fullWidth open={open} onClose={handleClose} maxWidth='md' scroll='body'>
      <DialogTitle
        variant='h4'
        className='flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16'
      >
        {dialogTitle}
        <Typography component='span' className='flex flex-col text-center text-textSecondary'>
          {dialogDescription}
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent className='overflow-visible pbs-0 pbe-6 pli-10 sm:pli-16'>
          <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4' disabled={loading}>
            <i className='ri-close-line text-textSecondary' />
          </IconButton>

          <Grid container spacing={4}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Full Name'
                placeholder='John Doe'
                value={formData.name}
                onChange={e => handleFieldChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                disabled={loading}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Address Line 1'
                placeholder='123 Main Street'
                value={formData.addressLine1}
                onChange={e => handleFieldChange('addressLine1', e.target.value)}
                error={!!errors.addressLine1}
                helperText={errors.addressLine1}
                disabled={loading}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Address Line 2'
                placeholder='Apartment, suite, etc. (optional)'
                value={formData.addressLine2}
                onChange={e => handleFieldChange('addressLine2', e.target.value)}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='City'
                placeholder='New York'
                value={formData.city}
                onChange={e => handleFieldChange('city', e.target.value)}
                error={!!errors.city}
                helperText={errors.city}
                disabled={loading}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='State/Province'
                placeholder='NY'
                value={formData.state}
                onChange={e => handleFieldChange('state', e.target.value)}
                error={!!errors.state}
                helperText={errors.state}
                disabled={loading}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Postal/ZIP Code'
                placeholder='10001'
                value={formData.pincode}
                onChange={e => handleFieldChange('pincode', e.target.value)}
                error={!!errors.pincode}
                helperText={errors.pincode}
                disabled={loading}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Country</InputLabel>
                <Select
                  label='Country'
                  value={formData.country}
                  onChange={e => handleFieldChange('country', e.target.value)}
                  disabled={loading}
                >
                  {countries.map((country) => (
                    <MenuItem key={country} value={country}>
                      {country}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Copy to billing option - only show for shipping address */}
            {addressType === 'shipping' && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={copyToBilling}
                      onChange={e => setCopyToBilling(e.target.checked)}
                      disabled={loading}
                    />
                  }
                  label='Use this address as billing address'
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions className='gap-2 justify-center pbs-0 pbe-10 pli-10 sm:pbe-16 sm:pli-16'>
          <Button
            variant='contained'
            type='submit'
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Updating...' : 'Update Address'}
          </Button>
          <Button
            variant='outlined'
            color='secondary'
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default EditAddressDialog