// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

const CustomerAddressBilling = ({ customerData }) => {
  return (
    <Grid container spacing={6}>
      {/* Billing Address */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card className='h-full'>
          <CardHeader 
            title={
              <Typography variant='h6' className='font-semibold'>
                Billing Address
              </Typography>
            }
            action={
              <Button variant='outlined' size='small' startIcon={<i className='ri-edit-line' />}>
                Edit
              </Button>
            }
          />
          <Divider />
          <CardContent className='flex flex-col gap-4'>
            {customerData?.billingAddress ? (
              <div className='flex flex-col gap-3'>
                <div className='flex items-center gap-3'>
                  <CustomAvatar variant='rounded' skin='light' color='primary' size={40}>
                    <i className='ri-map-pin-line' />
                  </CustomAvatar>
                  <div>
                    <Typography variant='h6' className='font-semibold'>
                      {customerData?.billingAddress?.name || customerData?.name || 'N/A'}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Billing Address
                    </Typography>
                  </div>
                </div>
                <div className='flex flex-col gap-1 pli-[52px]'>
                  <Typography variant='body1' className='font-medium'>
                    {customerData?.billingAddress?.addressLine1 || 'N/A'}
                  </Typography>
                  {customerData?.billingAddress?.addressLine2 && (
                    <Typography variant='body1' className='font-medium'>
                      {customerData.billingAddress.addressLine2}
                    </Typography>
                  )}
                  <Typography variant='body1' className='font-medium'>
                    {customerData?.billingAddress?.city || 'N/A'}, {customerData?.billingAddress?.state || 'N/A'} {customerData?.billingAddress?.pincode || ''}
                  </Typography>
                  <Typography variant='body1' className='font-medium'>
                    {customerData?.billingAddress?.country || 'N/A'}
                  </Typography>
                  <Typography variant='body1' className='font-medium text-primary'>
                    {customerData?.phone || 'N/A'}
                  </Typography>
                </div>
              </div>
            ) : (
              <div className='flex flex-col items-center gap-2 py-8'>
                <CustomAvatar variant='rounded' skin='light' color='secondary' size={48}>
                  <i className='ri-map-pin-line text-xl' />
                </CustomAvatar>
                <Typography variant='h6' color='text.secondary'>
                  No billing address
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Add a billing address for this customer.
                </Typography>
              </div>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Shipping Address */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card className='h-full'>
          <CardHeader 
            title={
              <Typography variant='h6' className='font-semibold'>
                Shipping Address
              </Typography>
            }
            action={
              <Button variant='outlined' size='small' startIcon={<i className='ri-edit-line' />}>
                Edit
              </Button>
            }
          />
          <Divider />
          <CardContent className='flex flex-col gap-4'>
            {customerData?.shippingAddress ? (
              <div className='flex flex-col gap-3'>
                <div className='flex items-center gap-3'>
                  <CustomAvatar variant='rounded' skin='light' color='info' size={40}>
                    <i className='ri-truck-line' />
                  </CustomAvatar>
                  <div>
                    <Typography variant='h6' className='font-semibold'>
                      {customerData?.shippingAddress?.name || customerData?.name || 'N/A'}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Shipping Address
                    </Typography>
                  </div>
                </div>
                <div className='flex flex-col gap-1 pli-[52px]'>
                  <Typography variant='body1' className='font-medium'>
                    {customerData?.shippingAddress?.addressLine1 || 'N/A'}
                  </Typography>
                  {customerData?.shippingAddress?.addressLine2 && (
                    <Typography variant='body1' className='font-medium'>
                      {customerData.shippingAddress.addressLine2}
                    </Typography>
                  )}
                  <Typography variant='body1' className='font-medium'>
                    {customerData?.shippingAddress?.city || 'N/A'}, {customerData?.shippingAddress?.state || 'N/A'} {customerData?.shippingAddress?.pincode || ''}
                  </Typography>
                  <Typography variant='body1' className='font-medium'>
                    {customerData?.shippingAddress?.country || 'N/A'}
                  </Typography>
                  <Typography variant='body1' className='font-medium text-primary'>
                    {customerData?.phone || 'N/A'}
                  </Typography>
                </div>
              </div>
            ) : (
              <div className='flex flex-col items-center gap-2 py-8'>
                <CustomAvatar variant='rounded' skin='light' color='secondary' size={48}>
                  <i className='ri-truck-line text-xl' />
                </CustomAvatar>
                <Typography variant='h6' color='text.secondary'>
                  No shipping address
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Add a shipping address for this customer.
                </Typography>
              </div>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Payment Methods */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader 
            title={
              <Typography variant='h6' className='font-semibold'>
                Payment Methods
              </Typography>
            }
            action={
              <Button 
                variant='contained' 
                startIcon={<i className='ri-add-line' />}
                size='small'
              >
                Add Payment Method
              </Button>
            }
          />
          <Divider />
          <CardContent>
            {customerData?.bankDetails?.accountNumber ? (
              <div className='flex flex-col gap-4'>
                <div className='flex items-center justify-between p-4 border rounded-lg bg-action-hover'>
                  <div className='flex items-center gap-4'>
                    <CustomAvatar variant='rounded' skin='light' color='success' size={48}>
                      <i className='ri-bank-line text-xl' />
                    </CustomAvatar>
                    <div>
                      <Typography variant='h6' className='font-semibold'>
                        {customerData?.bankDetails?.bankName || 'Bank Account'}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Account: ****{customerData.bankDetails.accountNumber.slice(-4)}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {customerData?.bankDetails?.accountHolderName}
                      </Typography>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Chip label='Bank Transfer' color='success' size='small' variant='tonal' />
                    <Button variant='outlined' size='small' startIcon={<i className='ri-edit-line' />}>
                      Edit
                    </Button>
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
                    No payment methods added yet
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Add a payment method to process transactions with this customer.
                  </Typography>
                </div>
                <Button 
                  variant='outlined' 
                  startIcon={<i className='ri-add-line' />}
                  className='mt-2'
                >
                  Add Your First Payment Method
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default CustomerAddressBilling