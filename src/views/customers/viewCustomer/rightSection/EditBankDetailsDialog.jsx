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

const EditBankDetailsDialog = ({ open, setOpen, customer, onSuccess }) => {
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Form state for bank details fields
  const [formData, setFormData] = useState({
    bankName: '',
    branch: '',
    accountHolderName: '',
    accountNumber: '',
    IFSC: ''
  })

  // Initialize form data when dialog opens or customer changes
  useEffect(() => {
    if (open && customer) {
      const bankData = customer.bankDetails || {}

      setFormData({
        bankName: bankData.bankName || '',
        branch: bankData.branch || '',
        accountHolderName: bankData.accountHolderName || customer?.name || '',
        accountNumber: bankData.accountNumber || '',
        IFSC: bankData.IFSC || ''
      })
      setErrors({})
    }
  }, [open, customer])

  // Validation function
  const validateForm = useCallback(() => {
    const newErrors = {}

    // Required fields validation
    if (!formData.bankName?.trim()) {
      newErrors.bankName = 'Bank name is required'
    }

    if (!formData.accountHolderName?.trim()) {
      newErrors.accountHolderName = 'Account holder name is required'
    }

    if (!formData.accountNumber?.trim()) {
      newErrors.accountNumber = 'Account number is required'
    }

    if (!formData.IFSC?.trim()) {
      newErrors.IFSC = 'IFSC/Routing code is required'
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
    enqueueSnackbar('Updating bank details...', { variant: 'info' })

    try {
      // Prepare complete customer data - include ALL existing fields plus the edited bank details
      const updateData = {
        // Include all existing customer data
        ...customer,

        // Update bank details
        bankDetails: formData
      }

      console.log('Updating bank details with data:', updateData)

      // Call the update API
      const result = await updateCustomer(customer._id, updateData)



      if (result.success) {
        enqueueSnackbar('Bank details updated successfully!', { variant: 'success' })

        // Call success callback if provided
        if (onSuccess) {
          onSuccess(result.data)
        }


      } else {
        enqueueSnackbar(result.message || 'Failed to update bank details', { variant: 'error' })
      }
    } catch (error) {
      console.error('Error updating bank details:', error)
      enqueueSnackbar(error.message || 'An error occurred while updating bank details', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [formData, validateForm, customer, enqueueSnackbar, onSuccess])

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
        Edit Bank Details
        <Typography component='span' className='flex flex-col text-center text-textSecondary'>
          Update the bank account information for this customer.
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
                label='Bank Name'
                placeholder='Bank of America'
                value={formData.bankName}
                onChange={e => handleFieldChange('bankName', e.target.value)}
                error={!!errors.bankName}
                helperText={errors.bankName}
                disabled={loading}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Branch Name'
                placeholder='Main Branch'
                value={formData.branch}
                onChange={e => handleFieldChange('branch', e.target.value)}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Account Holder Name'
                placeholder='John Doe'
                value={formData.accountHolderName}
                onChange={e => handleFieldChange('accountHolderName', e.target.value)}
                error={!!errors.accountHolderName}
                helperText={errors.accountHolderName}
                disabled={loading}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Account Number'
                placeholder='1234567890'
                value={formData.accountNumber}
                onChange={e => handleFieldChange('accountNumber', e.target.value)}
                error={!!errors.accountNumber}
                helperText={errors.accountNumber}
                disabled={loading}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label='IFSC/Routing Code'
                placeholder='ABCD0123456'
                value={formData.IFSC}
                onChange={e => handleFieldChange('IFSC', e.target.value)}
                error={!!errors.IFSC}
                helperText={errors.IFSC}
                disabled={loading}
                required
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
            {loading ? 'Updating...' : 'Update Bank Details'}
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

export default EditBankDetailsDialog