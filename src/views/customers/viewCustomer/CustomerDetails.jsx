// Next Imports
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import { formatCurrency } from '@/utils/currencyUtils'

// Utils Imports
import { getInitials } from '@/utils/getInitials'

const CustomerDetails = ({ customerData }) => {
  const getAvatar = () => {
    if (customerData?.avatar) {
      return <CustomAvatar src={customerData.avatar} variant='rounded' alt='Customer Avatar' size={120} />
    } else {
      return (
        <CustomAvatar variant='rounded' size={120}>
          {getInitials(customerData?.customer || 'Customer')}
        </CustomAvatar>
      )
    }
  }

  return (
    <Card>
      <CardContent className='flex flex-col pbs-12 gap-6'>
        <div className='flex flex-col justify-self-center items-center gap-6'>
          <div className='flex flex-col items-center gap-4'>
            {getAvatar()}
            <div className='flex flex-col items-center text-center'>
              <Typography variant='h5'>{customerData?.customer}</Typography>
              <Typography>Customer ID #{customerData?.customerId}</Typography>
            </div>
          </div>
          <div className='flex items-center justify-around gap-4 flex-wrap is-full'>
            <div className='flex items-center gap-4'>
              <CustomAvatar variant='rounded' skin='light' color='primary'>
                <i className='ri-shopping-cart-2-line' />
              </CustomAvatar>
              <div>
                <Typography variant='h5'>{customerData?.order || 0}</Typography>
                <Typography>Orders</Typography>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <CustomAvatar variant='rounded' skin='light' color='primary'>
                <i className='ri-money-dollar-circle-line' />
              </CustomAvatar>
              <div>
                <Typography variant='h5'>{formatCurrency(customerData?.totalSpent || 0)}</Typography>
                <Typography>Spent</Typography>
              </div>
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-4'>
          <Typography variant='h5'>Details</Typography>
          <Divider />
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-1'>
              <Typography color='text.primary' className='font-medium'>
                Username:
              </Typography>
              <Typography>{customerData?.customer}</Typography>
            </div>
            <div className='flex items-center gap-1'>
              <Typography color='text.primary' className='font-medium'>
                Email:
              </Typography>
              <Typography>{customerData?.email}</Typography>
            </div>
            <div className='flex items-center gap-1'>
              <Typography color='text.primary' className='font-medium'>
                Status:
              </Typography>
              <Chip 
                label={customerData?.status || 'Active'} 
                variant='tonal' 
                color={customerData?.status === 'Active' ? 'success' : 'error'} 
                size='small' 
              />
            </div>
            <div className='flex items-center gap-1'>
              <Typography color='text.primary' className='font-medium'>
                Contact:
              </Typography>
              <Typography>{customerData?.phone || 'N/A'}</Typography>
            </div>
            <div className='flex items-center gap-1'>
              <Typography color='text.primary' className='font-medium'>
                Country:
              </Typography>
              <Typography>{customerData?.country}</Typography>
            </div>
          </div>
        </div>
        <Button 
          variant='contained'
          component={Link}
          href={`/customers/customer-edit/${customerData?.customerId}`}
        >
          Edit Details
        </Button>
      </CardContent>
    </Card>
  )
}

export default CustomerDetails