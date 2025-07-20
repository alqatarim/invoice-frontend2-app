// Next Imports
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useMemo } from 'react'
// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import EditUserInfo from '@components/dialogs/edit-user-info'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import { formatCurrency } from '@/utils/currencyUtils'
import { Icon } from '@iconify/react'
// Utils Imports
import { getInitials } from '@/utils/getInitials'

const CustomerDetails = ({ customerData, cardDetails, permissions }) => {


  // Extract and transform customer data
  const customer = customerData

  // Vars
  const buttonProps = {
    variant: 'outlined',
    children: 'Edit Details'
  }

  const getAvatar = () => {
    if (customer?.image) {
      return <CustomAvatar src={`${process.env.NEXT_PUBLIC_API_URL}/${customer.image}`} variant='rounded' alt='Customer Avatar' size={120} />
    } else {
      return (
        <CustomAvatar variant='rounded' size={120} className='text-2xl font-medium'>
          {getInitials(customer?.name || 'Customer')}
        </CustomAvatar>
      )
    }
  }

  // Transform data for edit dialog
  const editDialogData = useMemo(() => {
    return {
      firstName: customer?.name?.split(' ')[0] || '',
      lastName: customer?.name?.split(' ').slice(1).join(' ') || '',
      userName: customer?.name || '',
      billingEmail: customer?.email || '',
      status: customer?.status || 'active',
      taxId: customer?.taxId || '',
      contact: customer?.phone || '',
      language: ['english'],
      country: customer?.billingAddress?.country || 'US',
      useAsBillingAddress: true
    }
  }, [customer])

  return (
    <Card className='h-full'>
      <CardContent className='flex flex-col pbs-12 gap-6'>
        <div className='flex flex-col justify-self-center items-center gap-6'>
          <div className='flex flex-col items-center gap-4'>
            {getAvatar()}
            <div className='flex flex-col items-center text-center gap-1'>
              <Typography variant='h5' className='font-semibold'>
                {customer?.name || 'N/A'}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Customer ID #{customer?._id?.slice(-8) || 'N/A'}
              </Typography>
            </div>
          </div>
          <div className='flex items-center justify-around gap-4 flex-wrap is-full'>
            <div className='flex items-center gap-4'>
              <CustomAvatar variant='rounded' skin='light' color='primary' size={48}>
                <Icon icon='iconamoon:invoice' width={28} />
              </CustomAvatar>
              <div className='text-left'>
                <Typography variant='h5' className='font-semibold'>
                  {cardDetails?.totalRecs?.[0]?.count || 0}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Invoices
                </Typography>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <CustomAvatar variant='rounded' skin='light' color='primary' size={48}>
              <Icon icon='lucide:saudi-riyal' width={23} />
              </CustomAvatar>
              <div className='text-center'>
                <Typography variant='h5' className='font-semibold'>
                  {formatCurrency(cardDetails?.totalRecs?.[0]?.amount || 0)}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Total Amount
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
                {customer?.name || 'N/A'}
              </Typography>
            </div>
            <div className='flex items-center justify-between'>
              <Typography color='text.secondary' className='font-medium'>
                Email:
              </Typography>
              <Typography color='text.primary' className='font-medium'>
                {customer?.email || 'No email provided'}
              </Typography>
            </div>
            <div className='flex items-center justify-between'>
              <Typography color='text.secondary' className='font-medium'>
                Status:
              </Typography>
              <Chip 
                label={customer?.status || 'Active'} 
                variant='tonal' 
                color={(customer?.status || 'Active') === 'Active' ? 'success' : 'error'} 
                size='small'
                className='font-medium'
              />
            </div>
            <div className='flex items-center justify-between'>
              <Typography color='text.secondary' className='font-medium'>
                Phone:
              </Typography>
              <Typography color='text.primary' className='font-medium'>
                {customer?.phone || 'N/A'}
              </Typography>
            </div>
            <div className='flex items-center justify-between'>
              <Typography color='text.secondary' className='font-medium'>
                Country:
              </Typography>
              <Typography color='text.primary' className='font-medium'>
                {customer?.billingAddress?.country || customer?.shippingAddress?.country || 'N/A'}
              </Typography>
            </div>
          </div>
        </div>
        
        {permissions?.canEdit && (
          <OpenDialogOnElementClick 
            element={Button} 
            elementProps={buttonProps} 
            dialog={EditUserInfo} 
            dialogProps={{ data: editDialogData }}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default CustomerDetails