// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import {
     Card,
     CardContent,
     Grid,
     TextField,
     Button,
     Typography,
     FormControl,
     InputLabel,
     Select,
     MenuItem,
     FormHelperText,
     Box,
     Avatar,
     IconButton,
     CircularProgress,
     Alert
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import dayjs from 'dayjs'

// Icon Imports
import { Icon } from '@iconify/react'

// Validation Schema
const accountSettingsSchema = yup.object().shape({
     firstName: yup.string().required('First name is required'),
     lastName: yup.string().required('Last name is required'),
     email: yup
          .string()
          .required('Email is required')
          .email('Email must be a valid email'),
     mobileNumber: yup
          .string()
          .required('Mobile number is required')
          .min(10, 'Mobile number must be at least 10 digits')
          .max(15, 'Mobile number must be at most 15 digits')
          .matches(/^\+?[1-9]\d*$/, 'Invalid phone number'),
     gender: yup.string().nullable(),
     DOB: yup.date().nullable()
})

const AccountSettingsForm = ({
     accountSettings = {},
     loading = false,
     updating = false,
     error = null,
     onUpdate,
     onRefresh
}) => {
     const [imagePreview, setImagePreview] = useState(null)
     const [imageError, setImageError] = useState('')

     const genderOptions = [
          { value: 2, label: 'Male' },
          { value: 3, label: 'Female' }
     ]

     const {
          control,
          handleSubmit,
          reset,
          setValue,
          formState: { errors }
     } = useForm({
          resolver: yupResolver(accountSettingsSchema),
          defaultValues: {
               firstName: '',
               lastName: '',
               email: '',
               mobileNumber: '',
               gender: '',
               DOB: null
          }
     })

     // Set form values when account settings are loaded
     useEffect(() => {
          if (accountSettings) {
               reset({
                    firstName: accountSettings.firstName || '',
                    lastName: accountSettings.lastName || '',
                    email: accountSettings.email || '',
                    mobileNumber: accountSettings.mobileNumber || '',
                    gender: accountSettings.gender || '',
                    DOB: accountSettings.DOB ? dayjs(accountSettings.DOB) : null
               })
               setImagePreview(accountSettings.image || null)
          }
     }, [accountSettings, reset])

     const handleImageChange = (event) => {
          const file = event.target.files[0]
          if (!file) return

          // Validate file type
          if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
               setImageError('Only PNG, JPG, and JPEG file types are supported.')
               return
          }

          const reader = new FileReader()
          reader.onload = (e) => {
               const img = new Image()
               img.onload = () => {
                    if (img.width < 150 || img.height < 150) {
                         setImageError('Profile picture should be minimum 150 x 150 pixels')
                         return
                    }
                    setImagePreview(e.target.result)
                    setValue('image', file)
                    setImageError('')
               }
               img.src = e.target.result
          }
          reader.readAsDataURL(file)
     }

     const onSubmit = async (data) => {
          if (!imagePreview) {
               setImageError('Profile image is required')
               return
          }

          try {
               await onUpdate({
                    ...data,
                    DOB: data.DOB ? dayjs(data.DOB).format('YYYY-MM-DD') : ''
               })
          } catch (error) {
               // Error is handled by the parent component
          }
     }

     const isEighteenOrOlder = (date) => {
          return date.isBefore(dayjs().subtract(18, 'year'), 'day')
     }

     return (
          <Card>
               <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                         {error && (
                              <Alert severity="error" className="mb-6">
                                   {error}
                              </Alert>
                         )}

                         {/* Profile Picture Section */}
                         <Box className="mb-8">
                              <Box className="flex items-center gap-6 mb-4">
                                   <Box className="relative">
                                        <Avatar
                                             src={imagePreview}
                                             sx={{ width: 120, height: 120 }}
                                             className="border-4 border-primary"
                                        />
                                        <input
                                             accept="image/png, image/jpeg, image/jpg"
                                             style={{ display: 'none' }}
                                             id="profile-image-upload"
                                             type="file"
                                             onChange={handleImageChange}
                                        />
                                        <label htmlFor="profile-image-upload">
                                             <IconButton
                                                  component="span"
                                                  className="absolute bottom-0 right-0 bg-primary text-white hover:bg-primary-dark"
                                                  size="small"
                                             >
                                                  <Icon icon="mdi:camera-outline" width={18} />
                                             </IconButton>
                                        </label>
                                   </Box>
                                   <Box>
                                        <Typography variant="h6" className="mb-2">
                                             Upload Profile Picture
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                             Profile picture should be minimum 150 x 150 pixels.
                                             <br />
                                             Supported file formats: JPG, PNG, JPEG.
                                        </Typography>
                                        {imageError && (
                                             <Typography variant="body2" color="error" className="mt-2">
                                                  {imageError}
                                             </Typography>
                                        )}
                                   </Box>
                              </Box>
                         </Box>

                         {/* General Information Section */}
                         <Typography variant="h6" className="mb-4">
                              General Information
                         </Typography>

                         <Grid container spacing={4} className="mb-6">
                              <Grid size={{ xs: 12, md: 6 }}>
                                   <Controller
                                        name="firstName"
                                        control={control}
                                        render={({ field }) => (
                                             <TextField
                                                  {...field}
                                                  fullWidth
                                                  label="First Name"
                                                  placeholder="Enter first name"
                                                  error={!!errors.firstName}
                                                  helperText={errors.firstName?.message}
                                             />
                                        )}
                                   />
                              </Grid>

                              <Grid size={{ xs: 12, md: 6 }}>
                                   <Controller
                                        name="lastName"
                                        control={control}
                                        render={({ field }) => (
                                             <TextField
                                                  {...field}
                                                  fullWidth
                                                  label="Last Name"
                                                  placeholder="Enter last name"
                                                  error={!!errors.lastName}
                                                  helperText={errors.lastName?.message}
                                             />
                                        )}
                                   />
                              </Grid>

                              <Grid size={{ xs: 12, md: 6 }}>
                                   <Controller
                                        name="email"
                                        control={control}
                                        render={({ field }) => (
                                             <TextField
                                                  {...field}
                                                  fullWidth
                                                  type="email"
                                                  label="Email"
                                                  placeholder="Enter email address"
                                                  error={!!errors.email}
                                                  helperText={errors.email?.message}
                                             />
                                        )}
                                   />
                              </Grid>

                              <Grid size={{ xs: 12, md: 6 }}>
                                   <Controller
                                        name="mobileNumber"
                                        control={control}
                                        render={({ field }) => (
                                             <TextField
                                                  {...field}
                                                  fullWidth
                                                  label="Mobile Number"
                                                  placeholder="Enter mobile number"
                                                  error={!!errors.mobileNumber}
                                                  helperText={errors.mobileNumber?.message}
                                                  inputProps={{ maxLength: 15 }}
                                             />
                                        )}
                                   />
                              </Grid>

                              <Grid size={{ xs: 12, md: 6 }}>
                                   <Controller
                                        name="gender"
                                        control={control}
                                        render={({ field }) => (
                                             <FormControl fullWidth error={!!errors.gender}>
                                                  <InputLabel>Gender</InputLabel>
                                                  <Select
                                                       {...field}
                                                       label="Gender"
                                                       placeholder="Choose gender"
                                                  >
                                                       {genderOptions.map((option) => (
                                                            <MenuItem key={option.value} value={option.value}>
                                                                 {option.label}
                                                            </MenuItem>
                                                       ))}
                                                  </Select>
                                                  {errors.gender && (
                                                       <FormHelperText>{errors.gender.message}</FormHelperText>
                                                  )}
                                             </FormControl>
                                        )}
                                   />
                              </Grid>

                              <Grid size={{ xs: 12, md: 6 }}>
                                   <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <Controller
                                             name="DOB"
                                             control={control}
                                             render={({ field }) => (
                                                  <DatePicker
                                                       {...field}
                                                       label="Date of Birth"
                                                       slotProps={{
                                                            textField: {
                                                                 fullWidth: true,
                                                                 error: !!errors.DOB,
                                                                 helperText: errors.DOB?.message
                                                            }
                                                       }}
                                                       maxDate={dayjs().subtract(18, 'year')}
                                                       onChange={(date) => {
                                                            if (date && isEighteenOrOlder(date)) {
                                                                 field.onChange(date)
                                                            } else if (date) {
                                                                 field.onChange(null)
                                                            }
                                                       }}
                                                  />
                                             )}
                                        />
                                   </LocalizationProvider>
                              </Grid>
                         </Grid>

                         {/* Action Buttons */}
                         <Box className="flex gap-4 justify-end">
                              <Button
                                   variant="outlined"
                                   color="secondary"
                                   onClick={() => onRefresh()}
                                   disabled={loading || updating}
                              >
                                   Cancel
                              </Button>
                              <Button
                                   type="submit"
                                   variant="contained"
                                   disabled={loading || updating}
                                   startIcon={updating && <CircularProgress size={20} />}
                              >
                                   {updating ? 'Saving...' : 'Save Changes'}
                              </Button>
                         </Box>
                    </form>
               </CardContent>
          </Card>
     )
}

export default AccountSettingsForm
