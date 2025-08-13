'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'

// Third-party Imports
import { useSnackbar } from 'notistack'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import EditBankDetailsDialog from './EditBankDetailsDialog'

// Utils Imports
import { formatDate } from '@/utils/dateUtils'

// Local currency formatter
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

// Handler Import
import { useCustomerAddressHandlers } from '@/handlers/customers/view'

// Helper function to check if customer has any bank details
const hasBankDetails = (customerData) => {
  return customerData?.bankDetails && 
         (customerData.bankDetails.bankName || 
          customerData.bankDetails.accountNumber || 
          customerData.bankDetails.accountHolderName || 
          customerData.bankDetails.branch || 
          customerData.bankDetails.IFSC)
}

// Placeholder function for future payment transactions feature
const fetchCustomerPayments = async (customerId) => {
  // TODO: Implement actual API call when backend payment transactions are ready
  // This is a placeholder for the future payments feature
  
  // Simulate loading delay for realistic UX
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Return empty array as placeholder - will be replaced with real data later
  return []
}

const PaymentMethodIcon = ({ method }) => {
  const getIcon = () => {
    switch (method?.toLowerCase()) {
      case 'cash':
        return 'ri-money-dollar-circle-line'
      case 'bank':
        return 'ri-bank-line'
      case 'cheque':
        return 'ri-file-list-3-line'
      case 'online':
        return 'ri-smartphone-line'
      default:
        return 'ri-money-dollar-circle-line'
    }
  }

  const getColor = () => {
    switch (method?.toLowerCase()) {
      case 'cash':
        return 'success'
      case 'bank':
        return 'primary'
      case 'cheque':
        return 'warning'
      case 'online':
        return 'info'
      default:
        return 'secondary'
    }
  }

  return (
    <CustomAvatar variant='rounded' skin='light' color={getColor()} size={32}>
      <i className={`${getIcon()} text-lg`} />
    </CustomAvatar>
  )
}

const StatusChip = ({ status }) => {
  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'success'
      case 'pending':
        return 'warning'
      case 'processing':
        return 'info'
      case 'failed':
        return 'error'
      case 'cancelled':
        return 'secondary'
      default:
        return 'default'
    }
  }

  return (
    <Chip
      label={status || 'Unknown'}
      color={getStatusColor()}
      size='small'
      variant='tonal'
    />
  )
}

const PaymentTransactions = ({ customerData, onCustomerUpdate }) => {
  // States
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  // Address handlers for dialog management
  const {
    dialogState,
    handleOpenBankDetailsDialog,
    handleCloseBankDetailsDialog,
    handleUpdateSuccess
  } = useCustomerAddressHandlers({
    onSuccess: (message) => {
      // Success notification will be handled by dialog components
    },
    onUpdate: (updatedCustomer) => {
      onCustomerUpdate?.(updatedCustomer)

    }
  })

  // Open delete confirmation dialog
  const handleDeleteBankDetails = () => {
    setDeleteConfirmOpen(true)
  }

  // Close delete confirmation dialog
  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false)
  }

  // Confirm and execute bank details deletion
  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    setDeleteConfirmOpen(false)

    try {
      enqueueSnackbar('Removing bank details...', { variant: 'info' })
      
      // Import the update action
      const { updateCustomer } = await import('@/app/(dashboard)/customers/actions')
      
      // Prepare customer data with empty bank details
      const updateData = {
        ...customerData,
        bankDetails: {
          bankName: '',
          branch: '',
          accountHolderName: '',
          accountNumber: '',
          IFSC: ''
        }
      }

      const result = await updateCustomer(customerData._id, updateData)
      
      if (result.success) {
        handleUpdateSuccess(result.data, 'Bank details removed successfully!')
      } else {
        enqueueSnackbar(result.message || 'Failed to remove bank details', { variant: 'error' })
      }
    } catch (error) {
      console.error('Error deleting bank details:', error)
      enqueueSnackbar('An error occurred while removing bank details', { variant: 'error' })
    } finally {
      setIsDeleting(false)
    }
  }

  // Fetch transactions on component mount
  useEffect(() => {
    const loadTransactions = async () => {
      if (customerData?._id) {
        setLoading(true)
        const payments = await fetchCustomerPayments(customerData._id)
        setTransactions(payments)
        setLoading(false)
      }
    }

    loadTransactions()
  }, [customerData?._id])

  return (
    <>
      <Grid container spacing={6}>
        {/* Bank Details Section */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title={
                <div className='flex items-center gap-3'>
                  <CustomAvatar variant='rounded' skin='light' color='success' size={40}>
                    <i className='ri-bank-line' />
                  </CustomAvatar>
                  <Typography variant='h6' className='font-semibold'>
                    Bank Details
                  </Typography>
                </div>
              }
              action={
                <div className='flex gap-2'>
                  <Button
                    variant='outlined'
                    startIcon={<i className='ri-edit-line' />}
                    size='small'
                    onClick={handleOpenBankDetailsDialog}
                  >
                    {hasBankDetails(customerData) ? 'Edit' : 'Add'}
                  </Button>
                  {hasBankDetails(customerData) && (
                    <Button
                      variant='outlined'
                      color='error'
                      startIcon={isDeleting ? <CircularProgress size={16} /> : <i className='ri-delete-bin-line' />}
                      size='small'
                      onClick={handleDeleteBankDetails}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                  )}
                </div>
              }
            />
            <Divider />
            <CardContent>
              {hasBankDetails(customerData) ? (
                <div className='flex flex-col items-start gap-4'>
                  <div className='flex flex-col gap-1 w-full'>
                    <div className='flex gap-2'>
                      <Typography variant='body2' color='text.secondary' className='font-medium min-w-[120px]'>
                        Bank Name
                      </Typography>
                      <Typography variant='body1' color='text.primary' className='font-medium'>
                        {customerData.bankDetails.bankName || 'N/A'}
                      </Typography>
                    </div>

                    <div className='flex gap-2'>
                      <Typography variant='body2' color='text.secondary' className='font-medium min-w-[120px]'>
                        Account Holder
                      </Typography>
                      <Typography variant='body1' color='text.primary' className='font-medium'>
                        {customerData.bankDetails.accountHolderName || 'N/A'}
                      </Typography>
                    </div>

                    <div className='flex gap-2'>
                      <Typography variant='body2' color='text.secondary' className='font-medium min-w-[120px]'>
                        Account Number
                      </Typography>
                      <div className='flex flex-col'>
                        {customerData.bankDetails.accountNumber ? (
                    
                            <Typography variant='body1' color='text.primary' className='font-medium'>
                              {customerData.bankDetails.accountNumber}
                            </Typography>
                     
                       
                        ) : (
                          <Typography variant='body1' color='text.primary' className='font-medium'>
                            N/A
                          </Typography>
                        )}
                      </div>
                    </div>

                    <div className='flex gap-2'>
                      <Typography variant='body2' color='text.secondary' className='font-medium min-w-[120px]'>
                        Branch
                      </Typography>
                      <Typography variant='body1' color='text.primary' className='font-medium'>
                        {customerData.bankDetails.branch || 'N/A'}
                      </Typography>
                    </div>

                    <div className='flex gap-2'>
                      <Typography variant='body2' color='text.secondary' className='font-medium min-w-[120px]'>
                        IFSC Code
                      </Typography>
                      <Typography variant='body1' color='text.primary' className='font-medium'>
                        {customerData.bankDetails.IFSC || 'N/A'}
                      </Typography>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='flex flex-col items-center gap-4 py-12'>
                  <CustomAvatar variant='rounded' skin='light' color='secondary' size={64}>
                    <i className='ri-bank-card-line text-3xl' />
                  </CustomAvatar>
                  <div className='text-center'>
                    <Typography variant='h6' color='text.secondary' className='font-semibold'>
                      No bank details added yet
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Add bank details to process transactions with this customer.
                    </Typography>
                  </div>
                  <Button
                    variant='outlined'
                    startIcon={<i className='ri-add-line' />}
                    className='mt-2'
                    onClick={handleOpenBankDetailsDialog}
                  >
                    Add Bank Details
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Transactions Section */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title={
                <div className='flex items-center gap-3'>
                  <CustomAvatar variant='rounded' skin='light' color='info' size={40}>
                    <i className='ri-exchange-line' />
                  </CustomAvatar>
                  <Typography variant='h6' className='font-semibold'>
                    Transaction History
                  </Typography>
                </div>
              }
              action={
                <Button
                  variant='outlined'
                  startIcon={<i className='ri-refresh-line' />}
                  size='small'
                  disabled
                  title="Feature coming soon"
                >
                  Refresh
                </Button>
              }
            />
            <Divider />
            <CardContent>
              {loading ? (
                <div className='flex justify-center items-center py-12'>
                  <CircularProgress />
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className='overflow-x-auto'>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Payment Number</TableCell>
                        <TableCell>Invoice</TableCell>
                        <TableCell>Method</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell align='right'>Amount</TableCell>
                        <TableCell align='center'>Status</TableCell>
                        <TableCell>Notes</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction._id} hover>
                          <TableCell>
                            <Typography variant='body1' className='font-medium'>
                              {transaction.payment_number}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant='body1' className='font-medium'>
                              {transaction.invoiceNumber || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <PaymentMethodIcon method={transaction.payment_method} />
                              <Typography variant='body2' className='font-medium'>
                                {transaction.payment_method}
                              </Typography>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Typography variant='body2'>
                              {formatDate(transaction.received_on) || formatDate(transaction.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell align='right'>
                            <Typography variant='body1' className='font-semibold'>
                              {formatCurrency(transaction.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell align='center'>
                            <StatusChip status={transaction.status} />
                          </TableCell>
                          <TableCell>
                            <Typography variant='body2' color='text.secondary'>
                              {transaction.notes || '-'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className='flex flex-col items-center gap-4 py-12'>
                  <CustomAvatar variant='rounded' skin='light' color='secondary' size={64}>
                    <i className='ri-exchange-line text-3xl' />
                  </CustomAvatar>
                  <div className='text-center'>
                    <Typography variant='h6' color='text.secondary' className='font-semibold'>
                      Transaction History Coming Soon
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Payment transaction tracking is currently in development and will be available in a future update.
                    </Typography>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Bank Details Dialog */}
      <EditBankDetailsDialog
        open={dialogState.bankDetails}
        setOpen={handleCloseBankDetailsDialog}
        customer={customerData}
        onSuccess={handleUpdateSuccess}
      />

      {/* Delete Bank Details Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          <div className='flex items-center gap-2'>
            <i className='ri-error-warning-line text-error' />
            <Typography variant='h6'>
              Delete Bank Details
            </Typography>
          </div>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove all bank details for this customer? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions className='gap-2 p-4'>
          <Button
            variant='outlined'
            onClick={handleCloseDeleteConfirm}
            disabled={isDeleting}
          >
            No, Cancel
          </Button>
          <Button
            variant='contained'
            color='error'
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} /> : <i className='ri-delete-bin-line' />}
          >
            {isDeleting ? 'Removing...' : 'Yes, Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default PaymentTransactions 