// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'

const CustomerAddressBilling = ({ customerData }) => {
  return (
    <Grid container spacing={6}>
      {/* Billing Address */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader 
            title='Billing Address'
            action={
              <Button variant='outlined' size='small'>
                Edit
              </Button>
            }
          />
          <CardContent>
            <div className='flex flex-col gap-2'>
              <Typography variant='h6'>{customerData?.name || 'N/A'}</Typography>
              <Typography>{customerData?.billingAddress?.addressLine1 || 'N/A'}</Typography>
              {customerData?.billingAddress?.addressLine2 && (
                <Typography>{customerData.billingAddress.addressLine2}</Typography>
              )}
              <Typography>
                {customerData?.billingAddress?.city || 'N/A'}, {customerData?.billingAddress?.state || 'N/A'} {customerData?.billingAddress?.pincode || ''}
              </Typography>
              <Typography>{customerData?.billingAddress?.country || 'N/A'}</Typography>
              <Typography className='font-medium'>{customerData?.phone || 'N/A'}</Typography>
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Shipping Address */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader 
            title='Shipping Address'
            action={
              <Button variant='outlined' size='small'>
                Edit
              </Button>
            }
          />
          <CardContent>
            <div className='flex flex-col gap-2'>
              <Typography variant='h6'>{customerData?.name || 'N/A'}</Typography>
              <Typography>{customerData?.shippingAddress?.addressLine1 || 'N/A'}</Typography>
              {customerData?.shippingAddress?.addressLine2 && (
                <Typography>{customerData.shippingAddress.addressLine2}</Typography>
              )}
              <Typography>
                {customerData?.shippingAddress?.city || 'N/A'}, {customerData?.shippingAddress?.state || 'N/A'} {customerData?.shippingAddress?.pincode || ''}
              </Typography>
              <Typography>{customerData?.shippingAddress?.country || 'N/A'}</Typography>
              <Typography className='font-medium'>{customerData?.phone || 'N/A'}</Typography>
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Payment Methods */}
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title='Payment Methods'
            action={
              <Button variant='contained' startIcon={<i className='ri-add-line' />}>
                Add Payment Method
              </Button>
            }
          />
          <CardContent>
            <div className='flex flex-col gap-4'>
              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div className='flex items-center gap-4'>
                  <div className='p-2 bg-primary/10 rounded'>
                    <i className='ri-bank-card-line text-primary text-xl' />
                  </div>
                  <div>
                    <Typography variant='h6'>**** **** **** 1234</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Credit Card
                    </Typography>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Chip label='Primary' color='primary' size='small' />
                  <Button variant='outlined' size='small'>
                    Edit
                  </Button>
                </div>
              </div>
              <Typography variant='body2' color='text.secondary' className='text-center'>
                No payment methods added yet
              </Typography>
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default CustomerAddressBilling