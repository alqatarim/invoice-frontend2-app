// Next Imports
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useMemo, useState } from 'react'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import EditCustomerDialog from './EditCustomerDialog'
import { formatCurrency } from '@/utils/currencyUtils'
import { Icon } from '@iconify/react'

// Utils Imports
import { getInitials } from '@/utils/getInitials'

const CustomerDetails = ({ customerData, cardDetails, permissions, onCustomerUpdate }) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  // Extract and transform customer data
  const customer = customerData

  // Vars
  const buttonProps = {
    variant: 'outlined',
    children: 'Edit Details',
    onClick: () => setEditDialogOpen(true)
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

  // Handle successful customer update
  const handleUpdateSuccess = (updatedCustomer) => {
    // Notify parent component to refresh customer data if callback provided
    if (onCustomerUpdate) {
      onCustomerUpdate(updatedCustomer)
    }

  }

  return (
    <>
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
            <Button {...buttonProps} />
          )}
        </CardContent>
      </Card>

      {/* Custom Edit Customer Dialog */}
      <EditCustomerDialog
        open={editDialogOpen}
        setOpen={setEditDialogOpen}
        customer={customer}
        onSuccess={handleUpdateSuccess}
      />
    </>
  )
}

export default CustomerDetails