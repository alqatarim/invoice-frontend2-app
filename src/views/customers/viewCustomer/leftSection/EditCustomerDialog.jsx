'use client'

// React Imports
import { useMemo } from 'react'

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

// Handler Import
import { useCustomerDetailsDialogHandlers } from '@/handlers/customers/view'

const EditCustomerDialog = ({ open, setOpen, customer, onSuccess }) => {
  const { enqueueSnackbar } = useSnackbar()

  // Handler for dialog management
  const {
    loading,
    errors,
    formData,
    handleFieldChange,
    handleSubmit,
    handleClose
  } = useCustomerDetailsDialogHandlers({
    customer,
    open,
    onClose: () => setOpen(false),
    onSuccess: (updatedCustomer) => {
      enqueueSnackbar('Customer updated successfully!', { variant: 'success' })
      onSuccess?.(updatedCustomer)
    },
    onError: (message) => {
      enqueueSnackbar(message, { variant: 'error' })
    }
  })

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