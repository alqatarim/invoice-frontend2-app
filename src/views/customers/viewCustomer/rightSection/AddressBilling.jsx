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

// Third-party Imports
import { countries } from 'country-codes-flags-phone-codes'

// CSS Import for flag icons
import 'flag-icons/css/flag-icons.min.css'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import EditAddressDialog from './EditAddressDialog'

// Handler Import
import { useCustomerAddressHandlers } from '@/handlers/customers/view'

// Helper function to get flag CSS class
const getFlagIcon = (countryCode) => {
  if (!countryCode) return null
  
  return (
    <span 
      className={`fi fi-${countryCode.toLowerCase()}`}
      style={{ marginRight: '8px' }}
      title={countryCode}
    />
  )
}

// Helper function to get country code from country name
const getCountryCodeFromName = (countryName) => {
  if (!countryName) return null
  const country = countries.find(c => c.name === countryName)
  return country ? country.code : null
}

// Helper function to get country name from country code (for backwards compatibility)
const getCountryNameFromCode = (countryCode) => {
  if (!countryCode) return ''
  const country = countries.find(c => c.code === countryCode)
  return country ? country.name : countryCode // fallback to code if not found
}

// Helper function to display country with flag
const displayCountryWithFlag = (countryValue) => {
  if (!countryValue) return 'N/A'
  
  let countryName = countryValue
  let countryCode = null
  
  // Check if it's a country code (≤ 3 chars) or country name
  if (countryValue.length <= 3) {
    // It's likely a country code, convert to name
    countryName = getCountryNameFromCode(countryValue)
    countryCode = countryValue
  } else {
    // It's likely a country name, get the code
    countryCode = getCountryCodeFromName(countryValue)
  }
  
  return (
    <div className='flex items-center'>
      {countryCode && getFlagIcon(countryCode)}
      <span>{countryName}</span>
    </div>
  )
}

const CustomerAddressBilling = ({ customerData, onCustomerUpdate }) => {
  // Address handlers for dialog management
  const {
    dialogState,
    handleOpenBillingAddressDialog,
    handleCloseBillingAddressDialog,
    handleOpenShippingAddressDialog,
    handleCloseShippingAddressDialog,
    handleUpdateSuccess
  } = useCustomerAddressHandlers({
    onSuccess: (message) => {
      // Success notification will be handled by dialog components
    },
    onUpdate: (updatedCustomer) => {
      onCustomerUpdate?.(updatedCustomer)
    }
  })

  return (
    <>
      <Grid container spacing={6}>
        {/* Billing Address */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card className='h-full'>
            <CardHeader
            title={
              <div className='flex items-center gap-3'>
              <CustomAvatar variant='rounded' skin='light' color='primary' size={40}>
                <i className='ri-map-pin-line' />
              </CustomAvatar> 
                <Typography variant='h6' className='font-semibold'>
                  Billing Address
                </Typography>

              </div>
            }
              action={
                <Button
                  variant='outlined'
                  size='small'
                  startIcon={<i className='ri-edit-line' />}
                  onClick={handleOpenBillingAddressDialog}
                >
                  Edit
                </Button>
              }
            />
            <Divider />
            <CardContent className='flex flex-col gap-4'>
              {customerData?.billingAddress ? (
                <div className='flex flex-col items-start gap-4'>
                  <div className='flex flex-col gap-1'>
                  <div className='flex gap-2'>
                  <Typography variant='body2' color='text.secondary' className='font-medium min-w-[60px]'>
                        Name
                      </Typography>
                      <Typography variant='body1' color='text.primary' className='font-medium'>
                        {customerData?.billingAddress?.name || 'N/A'}
                      </Typography>
                    </div>

                  <div className='flex gap-2'>
                      <Typography variant='body2' color='text.secondary' className='font-medium min-w-[60px]'>
                        City
                      </Typography>
                      <Typography variant='body1' color='text.primary' className='font-medium'>
                        {customerData?.billingAddress?.city || 'N/A'}
                      </Typography>
                    </div>

                    <div className='flex gap-2'>
                      <Typography variant='body2' color='text.secondary' className='font-medium min-w-[60px]'>
                        State
                      </Typography>
                      <Typography variant='body1' color='text.primary' className='font-medium'>
                        {customerData?.billingAddress?.state || 'N/A'}
                      </Typography>
                    </div>

                    <div className='flex gap-2'>
                      <Typography variant='body2' color='text.secondary' className='font-medium min-w-[60px]'>
                        Pincode
                      </Typography>
                      <Typography variant='body1' color='text.primary' className='font-medium'>
                        {customerData?.billingAddress?.pincode || 'N/A'}
                      </Typography>
                    </div>
                  

                    <div className='flex gap-2'>
                      <Typography variant='body2' color='text.secondary' className='font-medium min-w-[60px] '>
                        Address
                      </Typography>
                      <Typography variant='body1' color='text.primary' className='font-medium'>
                        {customerData?.billingAddress?.addressLine1 || 'N/A'}
                      </Typography>
                    </div>
                    {customerData?.billingAddress?.addressLine2 && (
                      <div className='flex gap-2'>
                        <Typography variant='body2' color='text.secondary' className='font-medium min-w-[60px]'>
                        </Typography>
                        <Typography variant='body1' className='font-medium'>
                          {customerData.billingAddress.addressLine2}
                        </Typography>
                      </div>
                    )}
                    
                    <div className='flex gap-2'>
                      <Typography variant='body2' color='text.secondary' className='font-medium min-w-[60px]'>
                        Country
                      </Typography>
                      <Typography variant='body1' color='text.primary' className='font-medium'>
                        {displayCountryWithFlag(customerData?.billingAddress?.country)}
                      </Typography>
                    </div>
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
                  <Button
                    variant='outlined'
                    startIcon={<i className='ri-add-line' />}
                    onClick={handleOpenBillingAddressDialog}
                    className='mt-2'
                  >
                    Add Billing Address
                  </Button>
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
                <div className='flex items-center gap-3'>
                <CustomAvatar variant='rounded' skin='light' color='info' size={40}>
                  <i className='ri-truck-line' />
                </CustomAvatar>
                  <Typography variant='h6' className='font-semibold'>
                    Shipping Address
                  </Typography>

                </div>
              }
              action={
                <Button
                  variant='outlined'
                  size='small'
                  startIcon={<i className='ri-edit-line' />}
                  onClick={handleOpenShippingAddressDialog}
                >
                  Edit
                </Button>
              }
            />
            <Divider />
            <CardContent className='flex flex-col gap-4'>
              {customerData?.shippingAddress ? (
                <div className='flex flex-col gap-4'>
                  <div className='flex flex-col gap-1'>

                  <div className='flex gap-2'>
                      <Typography variant='body2' color='text.secondary' className='font-medium min-w-[60px]'>
                        Name
                      </Typography>
                      <Typography variant='body1' color='text.primary' className='font-medium'>
                        {customerData?.shippingAddress?.name || 'N/A'}
                      </Typography>
                    </div>

                  <div className='flex gap-2'>
                      <Typography variant='body2' color='text.secondary' className='font-medium min-w-[60px]'>
                        City
                      </Typography>
                      <Typography variant='body1' color='text.primary' className='font-medium'>
                        {customerData?.shippingAddress?.city || 'N/A'}
                      </Typography>
                    </div>

                    <div className='flex gap-2'>
                      <Typography variant='body2' color='text.secondary' className='font-medium min-w-[60px]'>
                        State
                      </Typography>
                      <Typography variant='body1' color='text.primary' className='font-medium'>
                        {customerData?.shippingAddress?.state || 'N/A'}
                      </Typography>
                    </div>

                    <div className='flex gap-2'>
                      <Typography variant='body2' color='text.secondary' className='font-medium min-w-[60px]'>
                        Pincode
                      </Typography>
                      <Typography variant='body1' color='text.primary' className='font-medium'>
                        {customerData?.shippingAddress?.pincode || 'N/A'}
                      </Typography>
                    </div>

                    <div className='flex gap-2'>
                      <Typography variant='body2' color='text.secondary' className='font-medium min-w-[60px]'>
                        Address
                      </Typography>
                      <Typography variant='body1' color='text.primary' className='font-medium'>
                        {customerData?.shippingAddress?.addressLine1 || 'N/A'}
                      </Typography>
                    </div>
                    {customerData?.shippingAddress?.addressLine2 && (
                      <div className='flex gap-2'>
                        <Typography variant='body2' color='text.secondary' className='font-medium min-w-[60px]'>
                        </Typography>
                        <Typography variant='body1' color='text.primary' className='font-medium'>
                          {customerData.shippingAddress.addressLine2}
                        </Typography>
                      </div>
                    )}
                    <div className='flex gap-2'>
                      <Typography variant='body2' color='text.secondary' className='font-medium min-w-[60px]'>
                        Country
                      </Typography>
                      <Typography variant='body1' color='text.primary' className='font-medium'>
                        {displayCountryWithFlag(customerData?.shippingAddress?.country)}
                      </Typography>
                    </div>
                    
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
                  <Button
                    variant='outlined'
                    startIcon={<i className='ri-add-line' />}
                    onClick={handleOpenShippingAddressDialog}
                    className='mt-2'
                  >
                    Add Shipping Address
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </Grid>


      </Grid>

      {/* Edit Dialogs */}
      <EditAddressDialog
        open={dialogState.billingAddress}
        setOpen={handleCloseBillingAddressDialog}
        customer={customerData}
        addressType='billing'
        onSuccess={handleUpdateSuccess}
      />

      <EditAddressDialog
        open={dialogState.shippingAddress}
        setOpen={handleCloseShippingAddressDialog}
        customer={customerData}
        addressType='shipping'
        onSuccess={handleUpdateSuccess}
      />


    </>
  )
}

export default CustomerAddressBilling