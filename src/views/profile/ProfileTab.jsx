/**
 * ProfileTab Component - Account Settings with Schema-Based Validation
 *
 * Validation Approach:
 * - Uses profileSchema for comprehensive form validation on submission
 * - Real-time input restrictions derived from schema validation patterns
 * - Schema includes enhanced validation rules (patterns, length, age validation)
 * - Input handlers use validationHelpers from schema for consistency
 *
 * Permissions: 'accountSettings' module with 'view' and 'create' actions
 * Image Validation: Uses generic validateProfileImage utility from fileUtils
 */

'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import { Grid, Card, CardHeader, CardContent, Typography, TextField, Button, Avatar, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem, Divider, Box } from '@mui/material'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { Icon } from '@iconify/react'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import { useTheme } from '@mui/material/styles'

// Auth Imports
import { useSession } from 'next-auth/react'
import { usePermission } from '@/Auth/usePermission'

// Add imports for datasets
import { profilePersonalInfoIcons } from '@/data/dataSets'

// Schema import
import { profileSchema, validationHelpers } from './profileSchema'
import { genderOptions } from '@/data/dataSets'

// Utils imports
import {
  validateProfileImage
} from '@/utils'

const ProfileTab = ({ data, onUpdate, updating, error, enqueueSnackbar }) => {
  const [imagePreview, setImagePreview] = useState(data?.image || null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [imageError, setImageError] = useState('')
  const theme = useTheme()

  // Permission checks matching old app's accountSettings permissions
  const { data: session } = useSession()
  const canUpdate = usePermission('accountSettings', 'create') // Using 'create' action like old app
  const canView = usePermission('accountSettings', 'view')

  // Schema-based input validation handlers
  // These handlers use validation patterns from the schema to provide real-time input restrictions
  const handleNameKeyPress = (event) => {
    const keyCode = event.keyCode || event.which
    const keyValue = String.fromCharCode(keyCode)
    if (!validationHelpers.isValidNameCharacter(keyValue)) {
      event.preventDefault()
    }
  }

  const handlePhoneKeyPress = (event) => {
    const keyCode = event.keyCode || event.which
    const keyValue = String.fromCharCode(keyCode)
    if (!validationHelpers.isValidPhoneCharacter(keyValue)) {
      event.preventDefault()
    }
  }



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

  // Image validation and handling using extracted utility
  const handleImageChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const validation = await validateProfileImage(file)

    if (validation.isValid) {
      setImagePreview(validation.preview)
      setSelectedFile(file)
      setImageError('')
    } else {
      setImageError(validation.error)
      setImagePreview(null)
      setSelectedFile(null)
    }
  }

  const handleImageError = () => {
    setImagePreview(null)
    setImageError('')
  }

  // Form submission matching old implementation exactly
  const onSubmit = async (formData) => {
    // Check permissions before submitting like old implementation
    if (!canUpdate) {
      if (enqueueSnackbar) {
        enqueueSnackbar('You don\'t have permission to update account settings', {
          variant: 'error',
          autoHideDuration: 3000,
        })
      }
      return false
    }

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
          <Typography variant='body1'>
            {`${item.property.charAt(0).toUpperCase() + item.property.slice(1)}:`}
          </Typography>
          <Typography variant='h6'>{item.value.charAt(0).toUpperCase() + item.value.slice(1)}</Typography>
        </div>
      </div>
    ))
  }

    // Show access denied message if user doesn't have view permission
  if (!canView) {
    return (
      <Grid container spacing={6}>
        <Grid size={{xs:12}}>
          <Card>
            <CardContent className='flex flex-col items-center justify-center gap-4 text-center py-16'>
              <Icon icon='mdi:account-lock-outline' fontSize='4rem' color={theme.palette.error.main} />
              <div>
                <Typography variant='h5' className='mb-2'>
                  Access Denied
                </Typography>
                <Typography variant='body2' color='text.secondary' className='mb-4'>
                  You don't have permission to view account settings
                </Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      {/* About Section */}
      <Grid size={{xs:12, md:5, lg:4}}>
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

      <Grid size={{xs:12, md:7, lg:8}} component="form" onSubmit={handleSubmit(onSubmit)}>

         {/* Edit Profile Form */}
         <Card>
          <CardHeader title='Edit Profile' />
          <CardContent>
            {error && (
              <Alert severity="error" className='mb-6'>
                {error}
              </Alert>
            )}

              <Grid container spacing={6}>
                {/* Profile Picture Section */}
                <Grid size={{xs:12}}>
                  <div className='flex items-start gap-6'>
                    <CustomAvatar
                      src={imagePreview}
                      alt={data?.firstName ? `${data.firstName} ${data.lastName}` : 'User'}
                      size={100}
                      onError={handleImageError}
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
                        Minimum dimensions 150 * 150. Supported formats: JPG, PNG, JPEG.
                      </Typography>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="profile-image-upload"
                        type="file"
                        onChange={handleImageChange}
                        disabled={!canUpdate}
                      />
                      <div className='flex gap-4'>
                        <Button
                          variant="contained"
                          component="label"
                          htmlFor="profile-image-upload"
                          size="small"
                          disabled={!canUpdate}
                        >
                          Upload New Picture
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          disabled={!canUpdate}
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


                {/* First Name Field */}
                <Grid size={{xs:12, sm:6}}>
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
                        InputProps={{ readOnly: !canUpdate }}
                        onKeyPress={handleNameKeyPress}
                      />
                    )}
                  />
                </Grid>

                {/* Last Name Field */}
                <Grid size={{xs:12, sm:6}}>
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
                        InputProps={{ readOnly: !canUpdate }}
                        onKeyPress={handleNameKeyPress}
                      />
                    )}
                  />
                </Grid>

                {/* Email Field */}
                <Grid size={{xs:12, sm:6}}>
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
                        InputProps={{ readOnly: !canUpdate }}
                      />
                    )}
                  />
                </Grid>


                {/* Mobile Number Field */}
                <Grid size={{xs:12, sm:6}}>
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
                        InputProps={{ readOnly: !canUpdate }}
                        onKeyPress={handlePhoneKeyPress}
                      />
                    )}
                  />
                </Grid>

                {/* Gender Field */}
                <Grid size={{xs:12, sm:6}}>
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
                          readOnly={!canUpdate}
                          disabled={!canUpdate}
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

                {/* Date of Birth Field */}
                <Grid size={{xs:12, sm:6}}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Controller
                      name="DOB"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          label="Date of Birth"
                          value={field.value ? dayjs(field.value) : null}
                          readOnly={!canUpdate}
                          disabled={!canUpdate}
                          onChange={(newValue) => {
                            if (newValue) {
                              field.onChange(newValue.toDate())
                            } else {
                              field.onChange(null)
                            }
                          }}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.DOB,
                              helperText: errors.DOB?.message,
                              InputProps: { readOnly: !canUpdate }
                            }
                          }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
                </Grid>
                {/* Action Buttons */}
                                <Grid size={{xs:12}}>
                  <Box className='flex gap-4 mt-4 justify-end'>
                    {canUpdate && (
                      <>
                        <Button
                          className='px-10'
                          variant="outlined"
                          color='secondary'
                          onClick={() => window.location.reload()}
                          disabled={updating}
                        >
                          Cancel
                        </Button>

                        <Button
                          className='px-12'
                          type="submit"
                          variant="contained"
                          disabled={updating}
                          startIcon={updating ? <CircularProgress size={20} /> : ''}
                        >
                          {updating ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </>
                    )}
                    {!canUpdate && (
                      <Box className='flex items-center gap-2'>
                        <Icon icon='mdi:information-outline' color={theme.palette.warning.main} />
                        <Typography variant="body2" color="text.secondary">
                          You don't have permission to edit account settings
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>


          </CardContent>
        </Card>

      </Grid>



    </Grid>
  )
}

export default ProfileTab