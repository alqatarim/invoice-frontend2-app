'use client'

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
import { useBankDetailsDialogHandlers } from '@/handlers/customers/view'

const EditBankDetailsDialog = ({ open, setOpen, customer, onSuccess }) => {
  const { enqueueSnackbar } = useSnackbar()

  // Handler for bank details dialog management
  const {
    loading,
    errors,
    formData,
    handleFieldChange,
    handleSubmit,
    handleClose
  } = useBankDetailsDialogHandlers({
    customer,
    open,
    onClose: () => setOpen(false),
    onSuccess: (updatedCustomer, message) => {
      enqueueSnackbar(message, { variant: 'success' })
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