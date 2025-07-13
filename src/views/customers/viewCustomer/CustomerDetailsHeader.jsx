// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// MUI Imports
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

// Component Imports
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

const CustomerDetailsHeader = ({ customerId, customer, permissions }) => {
  const router = useRouter()

  // Vars
  const buttonProps = (children, color, variant) => ({
    children,
    color,
    variant
  })

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
        <Button
          variant='outlined'
          startIcon={<i className='ri-arrow-left-line' />}
          onClick={() => router.back()}
        >
          Back
        </Button>
        {permissions.canUpdate && (
          <Button
            variant='outlined'
            startIcon={<i className='ri-edit-line' />}
            component={Link}
            href={`/customers/customer-edit/${customerId}`}
          >
            Edit Customer
          </Button>
        )}
        {permissions.canCreateInvoice && customer?.status === 'Active' && (
          <Button
            variant='contained'
            startIcon={<i className='ri-add-line' />}
            component={Link}
            href={`/invoices/add?customerId=${customerId}`}
          >
            Create Invoice
          </Button>
        )}
        <OpenDialogOnElementClick
          element={Button}
          elementProps={buttonProps('Delete Customer', 'error', 'outlined')}
          dialog={ConfirmationDialog}
          dialogProps={{ type: 'delete-customer' }}
        />
      </div>
    </div>
  )
}

export default CustomerDetailsHeader