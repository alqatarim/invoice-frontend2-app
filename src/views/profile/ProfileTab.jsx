'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import { Grid, Card, CardHeader, CardContent, Typography, TextField, Button, Avatar, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem, Divider, Box } from '@mui/material'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { Icon } from '@iconify/react'
// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import { useTheme } from '@mui/material/styles'
// Add imports for datasets
import { profilePersonalInfoIcons } from '@/data/dataSets'

// Schema matching the old implementation
const profileSchema = yup.object({
  firstName: yup.string().required('Enter First name'),
  lastName: yup.string().required('Enter Last name'),
  email: yup.string().email('Email Must Be a Valid Email').required('Enter Email Address'),
  mobileNumber: yup
    .string()
    .required('Enter Mobile Number')
    .min(10, 'Mobile Number Must Be At Least 10 Digits')
    .max(15, 'Mobile Number Must Be At Most 15 Digits')
    .matches(/^\+?[1-9]\d*$/, 'Invalid phone number'),
  gender: yup.string().nullable(),
  DOB: yup.date().nullable()
})

const ProfileTab = ({ data, onUpdate, updating, error, enqueueSnackbar }) => {
  const [imagePreview, setImagePreview] = useState(data?.image || null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [imageError, setImageError] = useState('')
  const theme = useTheme()

  // Gender options matching old implementation
  const genderOptions = [
    { id: 2, text: "Male" },
    { id: 3, text: "Female" },
  ]

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      mobileNumber: '',
      gender: '',
      DOB: null
    }
  })

  useEffect(() => {
    if (data) {
      // Set the gender ID directly instead of the object
      setImagePreview(data.image)
      setValue('firstName', data.firstName || '')
      setValue('lastName', data.lastName || '')
      setValue('email', data.email || '')
      setValue('mobileNumber', data.mobileNumber || '')
      setValue('DOB', data.DOB || null)
      setValue('gender', data.gender || '')
    }
  }, [data, setValue])

  // Image validation and handling exactly like old implementation
  const handleImageChange = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()

    reader.onloadend = () => {
      const img = new Image()
      img.onload = () => {
        if (
          (img.width === 150 && img.height === 150) ||
          (img.width >= 150 && img.height >= 150)
        ) {
          setImagePreview(reader.result)
          setSelectedFile(file)
          setImageError('')
        } else {
          setImageError('Profile Pic should be minimum 150 * 150')
        }
      }
      img.onerror = () => {
        setImageError('Only PNG, JPG, and JPEG file types are supported.')
      }
      img.src = reader.result
    }

    if (file) {
      if (/\.(jpe?g|png)$/i.test(file.name)) {
        reader.readAsDataURL(file)
      } else {
        setImageError('Only PNG, JPG, and JPEG file types are supported.')
      }
    }
  }

  const handleImageError = () => {
    setImagePreview(null)
    setImageError('')
  }




  // Form submission matching old implementation exactly
  const onSubmit = async (formData) => {
    // Check for image requirement like old implementation
    // if (!imagePreview && !selectedFile) {
    //   setImageError('Profile Image is required')
    //   return false
    // }

    // if (!imageError) {
      const submitFormData = new FormData()

      // Add fields exactly like old implementation
      submitFormData.append('firstName', formData?.firstName)
      submitFormData.append('lastName', formData?.lastName)
      submitFormData.append('email', formData?.email)
      submitFormData.append('mobileNumber', formData?.mobileNumber)
      submitFormData.append('gender', formData?.gender || '')
      submitFormData.append('DOB', formData?.DOB ? dayjs(formData?.DOB).toDate() : '')
      submitFormData.append('image', selectedFile ? selectedFile : '')

      const result = await onUpdate(submitFormData)
      if (result?.success) {
        setSelectedFile(null)
        if (enqueueSnackbar) {
          enqueueSnackbar('Account Settings Updated Successfully', {
            variant: 'success',
            autoHideDuration: 3000,
          })
        }
      }
    // }
  }

  // Helper function to get gender label from value
  const getGenderLabel = (genderValue) => {
    if (!genderValue) return 'Not specified'
    const genderOption = genderOptions.find(option => option.id == genderValue)
    return genderOption ? genderOption.text : 'Not specified'
  }

  const renderPersonalInfo = () => {
    const personalData = [
      { property: 'first name', value: data?.firstName || 'Not specified' },
      { property: 'last name', value: data?.lastName || 'Not specified' },
      { property: 'email', value: data?.email || 'Not specified' },
      { property: 'phone', value: data?.mobileNumber || 'Not specified' },
      { property: 'gender', value: getGenderLabel(data?.gender) },
      { property: 'birth date', value: data?.DOB ? dayjs(data.DOB).format('MMM DD, YYYY') : 'Not specified' }
    ]

    return personalData.map((item, index) => (
      <div key={index} className='flex items-center gap-2'>
        <Icon icon={profilePersonalInfoIcons[item.property]} fontSize={23} color={theme.palette.secondary.main} />
        <div className='flex items-center flex-wrap gap-2'>
          <Typography className='font-medium'>
            {`${item.property.charAt(0).toUpperCase() + item.property.slice(1)}:`}
          </Typography>
          <Typography>{item.value.charAt(0).toUpperCase() + item.value.slice(1)}</Typography>
        </div>
      </div>
    ))
  }



  return (
    <Grid container spacing={6}>
      {/* About Section */}
      <Grid item xs={12} md={5} lg={4}>
        <Grid container spacing={6}>
          {/* Personal Information Card */}
          <Grid item xs={12}>
            <Card>
              <CardContent className='flex flex-col gap-6'>
                <div className='flex flex-col gap-4'>
                  <Typography variant='caption' className='uppercase'>
                    Personal Information
                  </Typography>
                  {renderPersonalInfo()}
                </div>
              </CardContent>
            </Card>
          </Grid>


        </Grid>
      </Grid>

      {/* Edit Profile Form */}
      <Grid item xs={12} md={7} lg={8}>
        <Card>
          <CardHeader title='Edit Profile' />
          <CardContent>
            {error && (
              <Alert severity="error" className='mb-6'>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={6}>
                {/* Profile Picture Section */}
                <Grid item xs={12}>
                  <div className='flex items-start gap-6'>
                    <CustomAvatar
                      src={imagePreview}
                      alt={data?.firstName ? `${data.firstName} ${data.lastName}` : 'User'}
                      size={100}
                    >
                      {data?.firstName?.[0]?.toUpperCase() || 'U'}
                    </CustomAvatar>
                    <div className='flex-grow'>
                      <Typography variant="h5" className='mb-2'>
                        {data?.firstName && data?.lastName
                          ? `${data.firstName} ${data.lastName}`
                          : 'User Name'
                        }
                      </Typography>
                      <Typography variant="body2" color="text.secondary" className='mb-4'>
                        Profile Picture should be minimum 150 * 150. Supported file formats: JPG, PNG, JPEG.
                      </Typography>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="profile-image-upload"
                        type="file"
                        onChange={handleImageChange}
                      />
                      <div className='flex gap-4'>
                        <Button
                          variant="contained"
                          component="label"
                          htmlFor="profile-image-upload"
                          size="small"
                        >
                          Upload New Picture
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={() => {
                            setImagePreview(null)
                            setSelectedFile(null)
                            setImageError('')
                          }}
                        >
                          Reset
                        </Button>
                      </div>
                      {imageError && (
                        <Typography variant="caption" color="error" className='block mt-2'>
                          {imageError}
                        </Typography>
                      )}
                    </div>
                  </div>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                  <Typography variant="h6" className='mt-4 mb-4'>
                    General Information
                  </Typography>
                </Grid>

                {/* Personal Information Fields */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="firstName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="First Name *"
                        error={!!errors.firstName}
                        helperText={errors.firstName?.message}
                        onKeyPress={(e) => {
                          const keyCode = e.keyCode || e.which
                          const keyValue = String.fromCharCode(keyCode)
                          if (/^\d+$/.test(keyValue)) {
                            e.preventDefault()
                          }
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="lastName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Last Name *"
                        error={!!errors.lastName}
                        helperText={errors.lastName?.message}
                        onKeyPress={(e) => {
                          const keyCode = e.keyCode || e.which
                          const keyValue = String.fromCharCode(keyCode)
                          if (/^\d+$/.test(keyValue)) {
                            e.preventDefault()
                          }
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Email *"
                        type="email"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="mobileNumber"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Mobile Number *"
                        error={!!errors.mobileNumber}
                        helperText={errors.mobileNumber?.message}
                        onKeyPress={(e) => {
                          const keyCode = e.keyCode || e.which
                          const keyValue = String.fromCharCode(keyCode)
                          if (!/^\d+$/.test(keyValue) && keyValue !== '+') {
                            e.preventDefault()
                          }
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.gender}>
                        <InputLabel>Gender</InputLabel>
                        <Select
                          {...field}
                          label="Gender"
                          value={field.value || ''}
                        >
                          <MenuItem value="">Choose Gender</MenuItem>
                          {genderOptions.map(option => (
                            <MenuItem key={option.id} value={option.id}>{option.text}</MenuItem>
                          ))}
                        </Select>
                        {errors.gender && (
                          <Typography variant="caption" color="error" className='mt-1 ml-2'>
                            {errors.gender.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Controller
                      name="DOB"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          label="Date of Birth"
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(newValue) => {
                            if (newValue) {
                              field.onChange(newValue.toDate())

                            } else {
                              field.onChange(null)
                            }
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              error={!!errors.DOB}
                              helperText={errors.DOB?.message}
                            />
                          )}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12}>
                  <div className='flex gap-4 mt-4'>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={updating}
                      startIcon={updating ? <CircularProgress size={20} /> : <i className='ri-save-line' />}
                    >
                      {updating ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => window.location.reload()}
                      disabled={updating}
                      startIcon={<i className='ri-refresh-line' />}
                    >
                      Reset
                    </Button>
                  </div>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ProfileTab