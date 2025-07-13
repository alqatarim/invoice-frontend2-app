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
import EditUserInfo from '@components/dialogs/edit-user-info'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import { formatCurrency } from '@/utils/currencyUtils'

// Utils Imports
import { getInitials } from '@/utils/getInitials'

const CustomerDetails = ({ customerData, originalCustomerData }) => {
  // Vars
  const buttonProps = {
    variant: 'outlined',
    children: 'Edit Details'
  }

  const getAvatar = () => {
    if (customerData?.avatar) {
      return <CustomAvatar src={customerData.avatar} variant='rounded' alt='Customer Avatar' size={120} />
    } else {
      return (
        <CustomAvatar variant='rounded' size={120} className='text-2xl font-medium'>
          {getInitials(customerData?.customer || 'Customer')}
        </CustomAvatar>
      )
    }
  }

  // Transform data for edit dialog
  const editDialogData = {
    firstName: originalCustomerData?.name?.split(' ')[0] || '',
    lastName: originalCustomerData?.name?.split(' ').slice(1).join(' ') || '',
    userName: originalCustomerData?.name || '',
    billingEmail: originalCustomerData?.email || '',
    status: originalCustomerData?.status || 'active',
    taxId: originalCustomerData?.taxId || '',
    contact: originalCustomerData?.phone || '',
    language: ['english'],
    country: originalCustomerData?.billingAddress?.country || 'US',
    useAsBillingAddress: true
  }

  return (
    <Card className='h-full'>
      <CardContent className='flex flex-col pbs-12 gap-6'>
        <div className='flex flex-col justify-self-center items-center gap-6'>
          <div className='flex flex-col items-center gap-4'>
            {getAvatar()}
            <div className='flex flex-col items-center text-center gap-1'>
              <Typography variant='h5' className='font-semibold'>
                {customerData?.customer}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Customer ID #{customerData?.customerId}
              </Typography>
            </div>
          </div>
          <div className='flex items-center justify-around gap-4 flex-wrap is-full'>
            <div className='flex items-center gap-4'>
              <CustomAvatar variant='rounded' skin='light' color='primary' size={48}>
                <i className='ri-shopping-cart-2-line text-xl' />
              </CustomAvatar>
              <div className='text-center'>
                <Typography variant='h5' className='font-semibold'>
                  {customerData?.order || 0}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Orders
                </Typography>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <CustomAvatar variant='rounded' skin='light' color='success' size={48}>
                <i className='ri-money-dollar-circle-line text-xl' />
              </CustomAvatar>
              <div className='text-center'>
                <Typography variant='h5' className='font-semibold'>
                  {formatCurrency(customerData?.totalSpent || 0)}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Outstanding
                </Typography>
              </div>
            </div>
          </div>
        </div>
        
        <div className='flex flex-col gap-4'>
          <Typography variant='h6' className='font-semibold'>
            Customer Details
          </Typography>
          <Divider />
          <div className='flex flex-col gap-4'>
            <div className='flex items-center justify-between'>
              <Typography color='text.secondary' className='font-medium'>
                Username:
              </Typography>
              <Typography color='text.primary' className='font-medium'>
                {customerData?.customer}
              </Typography>
            </div>
            <div className='flex items-center justify-between'>
              <Typography color='text.secondary' className='font-medium'>
                Email:
              </Typography>
              <Typography color='text.primary' className='font-medium'>
                {customerData?.email}
              </Typography>
            </div>
            <div className='flex items-center justify-between'>
              <Typography color='text.secondary' className='font-medium'>
                Status:
              </Typography>
              <Chip 
                label={customerData?.status || 'Active'} 
                variant='tonal' 
                color={customerData?.status === 'Active' ? 'success' : 'error'} 
                size='small'
                className='font-medium'
              />
            </div>
            <div className='flex items-center justify-between'>
              <Typography color='text.secondary' className='font-medium'>
                Phone:
              </Typography>
              <Typography color='text.primary' className='font-medium'>
                {originalCustomerData?.phone || 'N/A'}
              </Typography>
            </div>
            <div className='flex items-center justify-between'>
              <Typography color='text.secondary' className='font-medium'>
                Country:
              </Typography>
              <Typography color='text.primary' className='font-medium'>
                {customerData?.country}
              </Typography>
            </div>
          </div>
        </div>
        
        <OpenDialogOnElementClick 
          element={Button} 
          elementProps={buttonProps} 
          dialog={EditUserInfo} 
          dialogProps={{ data: editDialogData }}
        />
      </CardContent>
    </Card>
  )
}

export default CustomerDetails