'use client'

// React Imports
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import FormHelperText from '@mui/material/FormHelperText'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useForm, Controller } from 'react-hook-form'

// Component Imports
import { usePermission } from '@/Auth/usePermission'

const AddCustomerDrawer = props => {
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
      
      // Create new customer object
      const newCustomer = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        website: data.website,
        status: data.status,
        notes: data.notes,
        billingAddress: data.billingAddress,
        shippingAddress: billingAsSameAddress ? data.billingAddress : data.shippingAddress
      }
      
      // Add to local data (for demo purposes)
      const updatedData = [...(customerData || []), { 
        ...newCustomer, 
        _id: Date.now().toString(),
        balance: 0,
        noOfInvoices: 0,
        createdAt: new Date()
      }]
      
      if (setData) {
        setData(updatedData)
      }
      
      if (onSuccess) {
        onSuccess('Customer added successfully!')
      }
      
      // Reset and close
      resetForm()
      setBillingAsSameAddress(true)
      handleClose()
    } catch (error) {
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
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between pli-5 plb-4'>
        <Typography variant='h5'>Add a Customer</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-5'>
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
            <Typography color='text.primary' className='font-medium'>
              Basic Information
            </Typography>
            
            <Controller
              name='name'
              control={control}
              rules={{ required: 'Customer name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Customer Name'
                  placeholder='John Doe'
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
            
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
                  type='email'
                  label='Email Address'
                  placeholder='johndoe@gmail.com'
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />
            
            <Controller
              name='phone'
              control={control}
              rules={{ required: 'Phone number is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Phone Number'
                  placeholder='(397) 294-5153'
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                />
              )}
            />

            <Controller
              name='website'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Website'
                  placeholder='www.example.com'
                />
              )}
            />

            <FormControl fullWidth>
              <InputLabel id='status-select'>Status</InputLabel>
              <Controller
                name='status'
                control={control}
                render={({ field }) => (
                  <Select 
                    {...field}
                    labelId='status-select'
                    label='Status'
                  >
                    <MenuItem value='Active'>Active</MenuItem>
                    <MenuItem value='Deactive'>Inactive</MenuItem>
                  </Select>
                )}
              />
            </FormControl>

            <Typography color='text.primary' className='font-medium'>
              Billing Address
            </Typography>
            
            <Controller
              name='billingAddress.addressLine1'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Address Line 1'
                  placeholder='123 Main St'
                />
              )}
            />
            
            <Controller
              name='billingAddress.addressLine2'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Address Line 2'
                  placeholder='Apt 4B'
                />
              )}
            />
            
            <Controller
              name='billingAddress.city'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='City'
                  placeholder='New York'
                />
              )}
            />
            
            <Controller
              name='billingAddress.state'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='State/Province'
                  placeholder='NY'
                />
              )}
            />
            
            <Controller
              name='billingAddress.country'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Country'
                  placeholder='USA'
                />
              )}
            />
            
            <Controller
              name='billingAddress.pincode'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Post Code'
                  placeholder='10001'
                />
              )}
            />

            <div className='flex justify-between'>
              <div className='flex flex-col items-start gap-1'>
                <Typography color='text.primary' className='font-medium'>
                  Use as shipping address?
                </Typography>
                <Typography variant='body2'>Billing address will be used as shipping address.</Typography>
              </div>
              <Switch 
                checked={billingAsSameAddress} 
                onChange={(e) => handleBillingAddressToggle(e.target.checked)}
              />
            </div>

            {!billingAsSameAddress && (
              <>
                <Typography color='text.primary' className='font-medium'>
                  Shipping Address
                </Typography>
                
                <Controller
                  name='shippingAddress.addressLine1'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Address Line 1'
                      placeholder='123 Main St'
                    />
                  )}
                />
                
                <Controller
                  name='shippingAddress.addressLine2'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Address Line 2'
                      placeholder='Apt 4B'
                    />
                  )}
                />
                
                <Controller
                  name='shippingAddress.city'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='City'
                      placeholder='New York'
                    />
                  )}
                />
                
                <Controller
                  name='shippingAddress.state'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='State/Province'
                      placeholder='NY'
                    />
                  )}
                />
                
                <Controller
                  name='shippingAddress.country'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Country'
                      placeholder='USA'
                    />
                  )}
                />
                
                <Controller
                  name='shippingAddress.pincode'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Post Code'
                      placeholder='10001'
                    />
                  )}
                />
              </>
            )}

            <Controller
              name='notes'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Notes'
                  multiline
                  rows={3}
                  placeholder='Additional notes...'
                />
              )}
            />

            <div className='flex items-center gap-4'>
              <Button 
                variant='contained' 
                type='submit'
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                Add Customer
              </Button>
              <Button variant='outlined' color='error' type='reset' onClick={handleReset}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </PerfectScrollbar>
    </Drawer>
  )
}

export default AddCustomerDrawer