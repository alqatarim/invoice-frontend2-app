'use client'

// React Imports
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import FormHelperText from '@mui/material/FormHelperText'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { countries } from 'country-codes-flags-phone-codes'

// CSS Import for flag icons
import 'flag-icons/css/flag-icons.min.css'

// Component Imports
import { usePermission } from '@/Auth/usePermission'
import CustomAvatar from '@core/components/mui/Avatar'

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

const AddCustomerDialog = props => {
  // Props
  const { open, handleClose, onSuccess, onError, setData, customerData } = props

  // Router
  const router = useRouter()

  // Permissions
  const canCreate = usePermission('customer', 'create')

  // States
  const [billingAsSameAddress, setBillingAsSameAddress] = useState(true)
  const [loading, setLoading] = useState(false)

  // Hooks
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      website: '',
      status: 'Active',
      notes: '',
      billingAddress: {
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        country: '',
        pincode: ''
      },
      shippingAddress: {
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        country: '',
        pincode: ''
      }
    }
  })

  const billingAddress = watch('billingAddress')

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      
      // Create FormData for API submission (matching backend expectations)
      const formData = new FormData()
      
      // Add basic fields
      formData.append('name', data.name || '')
      formData.append('email', data.email || '')
      formData.append('phone', data.phone || '')
      formData.append('website', data.website || '')
      formData.append('status', data.status || 'Active')
      formData.append('notes', data.notes || '')
      
      // Add billing address
      if (data.billingAddress) {
        Object.keys(data.billingAddress).forEach(key => {
          formData.append(`billingAddress[${key}]`, data.billingAddress[key] || '')
        })
      }
      
      // Add shipping address (same as billing if toggle is on)
      const shippingData = billingAsSameAddress ? data.billingAddress : data.shippingAddress
      if (shippingData) {
        Object.keys(shippingData).forEach(key => {
          formData.append(`shippingAddress[${key}]`, shippingData[key] || '')
        })
      }
      
      // Add empty image field
      formData.append('image', '')
      
      // Add empty bank details
      const bankFields = ['bankName', 'branch', 'accountHolderName', 'accountNumber', 'IFSC']
      bankFields.forEach(field => {
        formData.append(`bankDetails[${field}]`, '')
      })


      for (let [key, value] of formData.entries()) {
        console.log(key, value)
      }

      // Import the addCustomer action
      const { addCustomer } = await import('@/app/(dashboard)/customers/actions')
      
      // Submit to API
      const response = await addCustomer(formData)
      
    
      
      if (response.code === 200) {
        if (onSuccess) {
          onSuccess('Customer added successfully!')
        }
        
        // Reset and close
        resetForm()
        setBillingAsSameAddress(true)
        handleClose()
        
        // Refresh the page to show the new customer
        window.location.reload()
      } else {
        if (onError) {
          onError(response?.data?.message || response?.message || 'Failed to add customer')
        }
      }
    } catch (error) {
      console.error('AddCustomerDrawer - Error:', error)
      if (onError) {
        onError('Failed to add customer: ' + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    handleClose()
    resetForm()
    setBillingAsSameAddress(true)
  }

  const handleBillingAddressToggle = (checked) => {
    setBillingAsSameAddress(checked)
    if (checked) {
      setValue('shippingAddress', billingAddress)
    }
  }

  if (!canCreate) {
    return null
  }

  return (
    <Dialog 
      fullWidth 
      open={open} 
      onClose={handleReset} 
      maxWidth='md' 
      scroll='paper'
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'flex-start',
          paddingTop: '5vh',
        },
        '& .MuiDialog-paper': {
          margin: '0 auto',
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle
        variant='h4'
        className='flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-12 sm:pbe-4 sm:pli-16'
      >
        Add Customer
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className='overflow-auto pbs-0 pbe-6 pli-12 sm:pli-12'>
          <IconButton onClick={handleReset} className='absolute block-start-4 inline-end-4' disabled={loading}>
            <i className='ri-close-line text-textSecondary' />
          </IconButton>

          <Grid container spacing={4}>
            <Grid size={{xs:12}}>
              <Box className='flex items-center gap-3'>
                <CustomAvatar variant='rounded' skin='light' color='success' size={40}>
                  <i className='ri-user-line' />
                </CustomAvatar>
                <Typography color='text.primary' className='font-medium'>
                  Basic Information
                </Typography>
               
                
              </Box>

              {/* <Divider orientation='horizontal'  textAlign='left' flexItem className='mt-2 w-[60%]' /> */}
              
            </Grid>
            
            <Grid size={{xs:12, md:6}}>
              <Controller
                name='name'
                control={control}
                rules={{ required: 'Customer name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size='small'
                    label='Customer Name'
                    placeholder='John Doe'
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={loading}
                    required
                  />
                )}
              />
            </Grid>
            
            <Grid size={{xs:12, md:6}}>
              <Controller
                name='email'
                control={control}
                rules={{ 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size='small'
                    type='email'
                    label='Email Address'
                    placeholder='johndoe@gmail.com'
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={loading}
                    required
                  />
                )}
              />
            </Grid>
            
            <Grid size={{xs:12, md:6}}>
              <Controller
                name='phone'
                control={control}
                rules={{ required: 'Phone number is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size='small'
                    label='Phone Number'
                    placeholder='(397) 294-5153'
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    disabled={loading}
                    required
                  />
                )}
              />
            </Grid>

            <Grid size={{xs:12, md:6}}>
              <Controller
                name='website'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size='small'
                    label='Website'
                    placeholder='www.example.com'
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid size={{xs:12, md:6}}>
              <Controller
                name='status'
                control={control}
                render={({ field }) => (
                  <Grid container spacing={2} className='items-center'>
                    <Grid size={{xs:4, md:4}}>
                    <Typography variant='body1' className='font-medium'>
                      Status: {field.value === 'Active' ? 'Active' : 'Inactive'}
                    </Typography>
                    </Grid>
                    <Grid size={{xs:1, md:1}}>
                    <Switch
                      checked={field.value === 'Active'}
                      onChange={(e) => field.onChange(e.target.checked ? 'Active' : 'Deactive')}
                      disabled={loading}
                      color='success'
                    />
                    </Grid>
                  </Grid>
                )}
              />
            </Grid>

            <Grid size={{xs:12}}>
              <Box className='flex items-center gap-3 mt-4'>
                <CustomAvatar variant='rounded' skin='light' color='primary' size={40}>
                  <i className='ri-map-pin-line' />
                </CustomAvatar>
                <Typography color='text.primary' className='font-medium'>
                  Billing Address
                </Typography>
              </Box>

              {/* <Divider orientation='horizontal'  textAlign='left' flexItem className='mt-2 w-[60%]' /> */}
            </Grid>
            
            <Grid size={{xs:12, md:6}}>
              <Controller
                name='billingAddress.addressLine1'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size='small'
                    label='Address Line 1'
                    placeholder='123 Main St'
                    disabled={loading}
                  />
                )}
              />
            </Grid>
            
            <Grid size={{xs:12, md:6}}>
              <Controller
                name='billingAddress.addressLine2'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size='small'
                    label='Address Line 2'
                    placeholder='Apt 4B'
                    disabled={loading}
                  />
                )}
              />
            </Grid>
            
            <Grid size={{xs:12, md:6}}>
              <Controller
                name='billingAddress.city'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size='small'
                    label='City'
                    placeholder='New York'
                    disabled={loading}
                  />
                )}
              />
            </Grid>
            
            <Grid size={{xs:12, md:6}}>
              <Controller
                name='billingAddress.state'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size='small'
                    label='State/Province'
                    placeholder='NY'
                    disabled={loading}
                  />
                )}
              />
            </Grid>
            
            <Grid size={{xs:12, md:6}}>
              <Controller
                name='billingAddress.pincode'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size='small'
                    label='Post Code'
                    placeholder='10001'
                    disabled={loading}
                  />
                )}
              />
            </Grid>
            
            <Grid size={{xs:6}}>
              <Controller
                name='billingAddress.country'
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <Autocomplete
                    {...field}
                    options={countries}
                    getOptionLabel={(option) => option.name || ''}
                    value={countries.find(country => country.name === value) || null}
                    onChange={(event, newValue) => {
                      onChange(newValue ? newValue.name : '')
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        size='small'
                        label='Country'
                        placeholder='Select country'
                        disabled={loading}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props} key={option.code}>
                        <div className='flex items-center gap-2'>
                          {getFlagIcon(option.code)}
                          <span>{option.name}</span>
                        </div>
                      </li>
                    )}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid size={{xs:12}}>
              <div className='flex justify-start items-center'>
               
                  <Typography color='text.primary' className='font-medium'>
                    Use as shipping address?
                  </Typography>
                 
                <Switch 
                  checked={billingAsSameAddress} 
                  onChange={(e) => handleBillingAddressToggle(e.target.checked)}
                  disabled={loading}
                />
              </div>
            </Grid>

            {!billingAsSameAddress && (
              <>
                <Grid size={{xs:12}}>
                  <div className='flex items-center gap-3 mt-4'>
                    <CustomAvatar variant='rounded' skin='light' color='info' size={40}>
                      <i className='ri-truck-line' />
                    </CustomAvatar>
                    <Typography color='text.primary' className='font-medium'>
                      Shipping Address
                    </Typography>
                  </div>
                </Grid>
                
                <Grid size={{xs:12, md:6}}>
                  <Controller
                    name='shippingAddress.addressLine1'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size='small'
                        label='Address Line 1'
                        placeholder='123 Main St'
                        disabled={loading}
                      />
                    )}
                  />
                </Grid>
                
                <Grid size={{xs:12, md:6}}>
                  <Controller
                    name='shippingAddress.addressLine2'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size='small'
                        label='Address Line 2'
                        placeholder='Apt 4B'
                        disabled={loading}
                      />
                    )}
                  />
                </Grid>
                
                <Grid size={{xs:12, md:6}}>
                  <Controller
                    name='shippingAddress.city'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size='small'
                        label='City'
                        placeholder='New York'
                        disabled={loading}
                      />
                    )}
                  />
                </Grid>
                
                <Grid size={{xs:12, md:6}}>
                  <Controller
                    name='shippingAddress.state'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size='small'
                        label='State/Province'
                        placeholder='NY'
                        disabled={loading}
                      />
                    )}
                  />
                </Grid>
                
                <Grid size={{xs:12, md:6}}>
                  <Controller
                    name='shippingAddress.pincode'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size='small'
                        label='Post Code'
                        placeholder='10001'
                        disabled={loading}
                      />
                    )}
                  />
                </Grid>
                
                <Grid size={{xs:6}}>
                  <Controller
                    name='shippingAddress.country'
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <Autocomplete
                        {...field}
                        options={countries}
                        getOptionLabel={(option) => option.name || ''}
                        value={countries.find(country => country.name === value) || null}
                        onChange={(event, newValue) => {
                          onChange(newValue ? newValue.name : '')
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            size='small'
                            label='Country'
                            placeholder='Select country'
                            disabled={loading}
                          />
                        )}
                        renderOption={(props, option) => (
                          <li {...props} key={option.code}>
                            <div className='flex items-center gap-2'>
                              {getFlagIcon(option.code)}
                              <span>{option.name}</span>
                            </div>
                          </li>
                        )}
                        disabled={loading}
                      />
                    )}
                  />
                </Grid>
              </>
            )}

            <Grid size={{xs:12}}>
              <Controller
                name='notes'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size='small'
                    label='Notes'
                    multiline
                    rows={2}
                    placeholder='Additional notes...'
                    disabled={loading}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions className='gap-2 justify-center pbs-0 pbe-7 pli-10 sm:pbe-7 sm:pli-16'>
          <Button
            variant='outlined'
            color='secondary'
            onClick={handleReset}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            type='submit'
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Adding...' : 'Add Customer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddCustomerDialog

// Backward compatibility export
export { AddCustomerDialog as AddCustomerDrawer }