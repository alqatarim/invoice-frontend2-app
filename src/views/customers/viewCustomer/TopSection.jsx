// Next Imports
import Link from 'next/link'
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

// Component Imports
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

const CustomerDetailsHeader = ({ customerId, customer, permissions }) => {
  const router = useRouter()

  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  const handleCreateInvoice = useCallback(() => {
    if (customerId) {
      router.push(`/invoices/add?customerId=${customerId}`)
    }
  }, [customerId, router])

  return (
    <div className='flex flex-wrap justify-between max-sm:flex-col sm:items-center gap-x-6 gap-y-4'>
      <div className='flex flex-col items-start gap-1'>
        <Typography variant='h4'>{`Customer ID #${customerId?.slice(-8) || 'N/A'}`}</Typography>
        <Typography>{new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })} (ET)</Typography>
      </div>
      <div className='flex gap-4'>
     
     
        {permissions.canCreateInvoice && customer?.status === 'Active' && (
          <Button
            variant='contained'
            startIcon={<i className='ri-add-line' />}
            onClick={handleCreateInvoice}
          >
            Create Invoice
          </Button>
        )}

<Button
          flex = {1}
          variant='outlined'
          startIcon={<i className='ri-arrow-left-line' />}
          onClick={handleBack}
        >
          Back
        </Button>

        {/* <OpenDialogOnElementClick
          element={Button}
          elementProps={buttonProps('Delete Customer', 'error', 'outlined')}
          dialog={ConfirmationDialog}
          dialogProps={{ type: 'delete-customer' }}
        /> */}
      </div>
    </div>
  )
}

export default CustomerDetailsHeader