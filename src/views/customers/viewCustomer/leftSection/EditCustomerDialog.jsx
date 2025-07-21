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
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import { useSnackbar } from 'notistack'

// Actions Import
import { updateCustomer } from '@/app/(dashboard)/customers/actions'

const EditCustomerDialog = ({ open, setOpen, customer, onSuccess }) => {
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Form state - only editable fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    notes: ''
  })

  // Initialize form data when dialog opens or customer changes
  useEffect(() => {
    if (open && customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        website: customer.website || '',
        notes: customer.notes || ''
      })
      setErrors({})
    }
  }, [open, customer])

  // Validation function
  const validateForm = useCallback(() => {
    const newErrors = {}

    // Required fields validation
    if (!formData.name?.trim()) {
      newErrors.name = 'Customer name is required'
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    // Website validation (optional but must be valid URL if provided)
    if (formData.website && formData.website.trim()) {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
      if (!urlPattern.test(formData.website)) {
        newErrors.website = 'Please enter a valid website URL'
      }
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

    // Show loading notification
    enqueueSnackbar('Updating customer details...', { variant: 'info' })

    try {
      // Prepare complete customer data - include ALL existing fields plus the edited ones
      const updateData = {
        // Edited fields from form
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        website: formData.website || '',
        notes: formData.notes || '',

        // Preserve all existing fields that aren't being edited
        status: customer.status || 'Active',
        taxId: customer.taxId || '',

        // Preserve address information
        billingAddress: customer.billingAddress || {},
        shippingAddress: customer.shippingAddress || {},

        // Preserve bank details
        bankDetails: customer.bankDetails || {},

        // Preserve any other existing fields
        image: customer.image || '',
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,

        // Include any additional customer fields that might exist
        ...customer,

        // Override with the edited fields (this ensures our edits take precedence)
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        website: formData.website || '',
        notes: formData.notes || ''
      }

      console.log('Updating customer with data:', updateData) // Debug log

      // Call the update API
      const result = await updateCustomer(customer._id, updateData)

      console.log('Update result:', result) // Debug log

      if (result.success) {
        enqueueSnackbar('Customer updated successfully!', { variant: 'success' })

        // Call success callback if provided
        if (onSuccess) {
          onSuccess(result.data)
        }

        // Close dialog after a short delay to allow user to see the success message
        setTimeout(() => {
          handleClose()
        }, 1000)
      } else {
        enqueueSnackbar(result.message || 'Failed to update customer', { variant: 'error' })
      }
    } catch (error) {
      console.error('Error updating customer:', error)
      enqueueSnackbar(error.message || 'An error occurred while updating the customer', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [formData, validateForm, customer, enqueueSnackbar, onSuccess, handleClose])

  // Handle dialog close
  const handleClose = useCallback(() => {
    if (!loading) {
      setOpen(false)
      setErrors({})
    }
  }, [loading, setOpen])

  return (
    <Dialog fullWidth open={open} onClose={handleClose} maxWidth='sm' scroll='body'>
      <DialogTitle
        variant='h4'
        className='flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16'
      >
        Edit Customer Details
        <Typography component='span' className='flex flex-col text-center text-textSecondary'>
          Update customer information. All changes will be saved immediately.
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
                label='Customer Name'
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
                type='email'
                label='Email Address'
                placeholder='john.doe@email.com'
                value={formData.email}
                onChange={e => handleFieldChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                disabled={loading}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Phone Number'
                placeholder='+1 234 567 8900'
                value={formData.phone}
                onChange={e => handleFieldChange('phone', e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone}
                disabled={loading}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Website'
                placeholder='https://example.com'
                value={formData.website}
                onChange={e => handleFieldChange('website', e.target.value)}
                error={!!errors.website}
                helperText={errors.website}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label='Notes'
                placeholder='Additional notes about the customer...'
                value={formData.notes}
                onChange={e => handleFieldChange('notes', e.target.value)}
                disabled={loading}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions className='gap-2 justify-center pbs-0 pbe-10 pli-10 sm:pbe-16 sm:pli-16'>
          <Button
            variant='contained'
            type='submit'
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Updating...' : 'Update Customer'}
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

export default EditCustomerDialog