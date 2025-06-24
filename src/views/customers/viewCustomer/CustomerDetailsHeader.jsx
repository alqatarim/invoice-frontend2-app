// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// MUI Imports
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

const CustomerDetailsHeader = ({ customerId, customer, permissions }) => {
  const router = useRouter()

  return (
    <div className='flex flex-wrap justify-between max-sm:flex-col sm:items-center gap-x-6 gap-y-4'>
      <div className='flex flex-col items-start gap-1'>
        <Typography variant='h4'>{`Customer Details - ${customer?.name || 'N/A'}`}</Typography>
        <Typography>Customer ID #{customerId?.slice(-8) || 'N/A'}</Typography>
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
      </div>
    </div>
  )
}

export default CustomerDetailsHeader