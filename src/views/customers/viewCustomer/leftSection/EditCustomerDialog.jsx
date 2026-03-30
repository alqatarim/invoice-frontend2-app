'use client'

// React Imports
import { useCallback, useEffect, useState } from 'react'

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
import { updateCustomer } from '@/app/(dashboard)/customers/actions'

const EditCustomerDialog = ({ open, setOpen, customer, onSuccess }) => {
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    notes: ''
  })

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

  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  const validateForm = useCallback(() => {
    const nextErrors = {}

    if (!formData.name?.trim()) {
      nextErrors.name = 'Customer name is required'
    }

    if (!formData.email?.trim()) {
      nextErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = 'Please enter a valid email address'
    }

    if (!formData.phone?.trim()) {
      nextErrors.phone = 'Phone number is required'
    }

    if (formData.website?.trim()) {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/

      if (!urlPattern.test(formData.website)) {
        nextErrors.website = 'Please enter a valid website URL'
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }, [formData])

  const handleClose = useCallback(() => {
    if (!loading) {
      setOpen(false)
      setErrors({})
    }
  }, [loading, setOpen])

  const handleSubmit = useCallback(async event => {
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

    try {
      const updateData = {
        ...customer,
        ...formData,
        website: formData.website || '',
        notes: formData.notes || ''
      }

      const result = await updateCustomer(customer._id, updateData)

      if (result.success) {
        enqueueSnackbar('Customer updated successfully!', { variant: 'success' })
        onSuccess?.(result.data)
        setTimeout(() => setOpen(false), 1000)
      } else {
        enqueueSnackbar(result.message || 'Failed to update customer', { variant: 'error' })
      }
    } catch (error) {
      console.error('Error updating customer:', error)
      enqueueSnackbar(error.message || 'An error occurred while updating the customer', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [customer, enqueueSnackbar, formData, onSuccess, setOpen, validateForm])

  return (
    <Dialog fullWidth open={open} onClose={handleClose} maxWidth='sm' scroll='body'>
      <DialogTitle
        variant='h4'
        className='flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16'
      >
        Edit Customer Details
   
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent className='overflow-visible pbs-0 pbe-6 pli-12 sm:pli-12'>
          <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4' disabled={loading}>
            <i className='ri-close-line text-textSecondary' />
          </IconButton>

          <Grid container spacing={4}>
            <Grid size={{xs:12, md:6}}>
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

            <Grid size={{xs:12, md:6}}>
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

            <Grid size={{xs:12, md:6}}>
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

            <Grid size={{xs:12, md:6}}>
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

            <Grid size={{xs:12}}>
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
            variant='outlined'
            color='secondary'
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            type='submit'
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Updating...' : 'Update Customer'}
          </Button>
        
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default EditCustomerDialog