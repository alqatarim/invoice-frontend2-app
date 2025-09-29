'use client'

import { useState, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
     Dialog,
     DialogTitle,
     DialogContent,
     DialogActions,
     TextField,
     Button,
     Typography,
     IconButton,
     CircularProgress,
     Box,
     Grid,
     FormControl,
     InputLabel,
     Select,
     MenuItem,
     FormHelperText,
     InputAdornment,
     Avatar,
     Divider,
} from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import { Icon } from '@iconify/react'
import { useDropzone } from 'react-dropzone'
import { userValidationRules, userStatusOptions, genderOptions } from '@/data/dataSets'

// Validation schema for add
const addUserSchema = yup.object().shape({
     firstName: yup
          .string()
          .required(userValidationRules.firstName.required)
          .min(2, userValidationRules.firstName.minLength.message)
          .max(50, userValidationRules.firstName.maxLength.message),
     lastName: yup
          .string()
          .required(userValidationRules.lastName.required)
          .min(2, userValidationRules.lastName.minLength.message)
          .max(50, userValidationRules.lastName.maxLength.message),
     userName: yup
          .string()
          .optional()
          .min(3, userValidationRules.userName.minLength.message)
          .max(30, userValidationRules.userName.maxLength.message)
          .matches(/^[a-zA-Z0-9_]+$/, userValidationRules.userName.pattern.message),
     email: yup
          .string()
          .required(userValidationRules.email.required)
          .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, userValidationRules.email.pattern.message),
     mobileNumber: yup
          .string()
          .optional()
          .matches(/^[\+]?[0-9\-\(\)\s]+$/, userValidationRules.mobileNumber.pattern.message),
     role: yup
          .string()
          .required(userValidationRules.role.required),
     password: yup
          .string()
          .required(userValidationRules.password.required)
          .min(8, userValidationRules.password.minLength.message)
          .matches(
               /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
               userValidationRules.password.pattern.message
          ),
     confirmPassword: yup
          .string()
          .required('Confirm password is required')
          .oneOf([yup.ref('password'), null], 'Passwords must match'),
     status: yup
          .string()
          .required(userValidationRules.status.required),
     gender: yup
          .string()
          .optional(),
})

// Validation schema for edit (no password required)
const editUserSchema = yup.object().shape({
     firstName: yup
          .string()
          .required(userValidationRules.firstName.required)
          .min(2, userValidationRules.firstName.minLength.message)
          .max(50, userValidationRules.firstName.maxLength.message),
     lastName: yup
          .string()
          .required(userValidationRules.lastName.required)
          .min(2, userValidationRules.lastName.minLength.message)
          .max(50, userValidationRules.lastName.maxLength.message),
     userName: yup
          .string()
          .optional()
          .min(3, userValidationRules.userName.minLength.message)
          .max(30, userValidationRules.userName.maxLength.message)
          .matches(/^[a-zA-Z0-9_]+$/, userValidationRules.userName.pattern.message),
     email: yup
          .string()
          .required(userValidationRules.email.required)
          .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, userValidationRules.email.pattern.message),
     mobileNumber: yup
          .string()
          .optional()
          .matches(/^[\+]?[0-9\-\(\)\s]+$/, userValidationRules.mobileNumber.pattern.message),
     role: yup
          .string()
          .required(userValidationRules.role.required),
     status: yup
          .string()
          .required(userValidationRules.status.required),
     gender: yup
          .string()
          .optional(),
})

const UserDialog = ({ open, onClose, data, onSubmit, loading, roles = [] }) => {
     const theme = useTheme()
     const isEdit = !!data?._id

     // File upload setup
     const [fileImage, setFileImage] = useState([])
     const [previewImage, setPreviewImage] = useState('')
     const [showPassword, setShowPassword] = useState(false)
     const [showConfirmPassword, setShowConfirmPassword] = useState(false)

     // Form setup with dynamic schema
     const {
          control,
          handleSubmit,
          setValue,
          reset,
          formState: { errors },
     } = useForm({
          resolver: yupResolver(isEdit ? editUserSchema : addUserSchema),
          defaultValues: {
               firstName: '',
               lastName: '',
               userName: '',
               email: '',
               mobileNumber: '',
               role: '',
               password: '',
               confirmPassword: '',
               status: 'Active',
               gender: '',
          },
     })

     // Dropzone setup
     const { getRootProps, getInputProps } = useDropzone({
          maxLength: 1,
          accept: {
               'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
          },
          onDrop: (acceptedFiles) => {
               setFileImage(acceptedFiles)
               getBase64(acceptedFiles?.[0]).then((result) => {
                    setPreviewImage(result)
                    setValue('image', acceptedFiles?.[0])
               })
          },
     })

     const getBase64 = (file) => {
          return new Promise((resolve) => {
               let baseURL = ''
               let reader = new FileReader()
               reader.readAsDataURL(file)
               reader.onload = () => {
                    baseURL = reader.result
                    resolve(baseURL)
               }
          })
     }

     // Reset form when dialog opens/closes
     useEffect(() => {
          if (open) {
               if (data) {
                    // Edit mode - populate with existing data
                    reset({
                         firstName: data.firstName || '',
                         lastName: data.lastName || '',
                         userName: data.userName || '',
                         email: data.email || '',
                         mobileNumber: data.mobileNumber || '',
                         role: data.role || '',
                         status: data.status || 'Active',
                         gender: data.gender || '',
                         password: '',
                         confirmPassword: '',
                    })
                    if (data.image) {
                         setPreviewImage(data.image)
                    }
               } else {
                    // Add mode - reset to defaults
                    reset({
                         firstName: '',
                         lastName: '',
                         userName: '',
                         email: '',
                         mobileNumber: '',
                         role: '',
                         password: '',
                         confirmPassword: '',
                         status: 'Active',
                         gender: '',
                    })
                    setPreviewImage('')
                    setFileImage([])
               }
          }
     }, [open, data, reset])

     const handleFormSubmit = async (formData) => {
          const userData = {
               firstName: formData.firstName,
               lastName: formData.lastName,
               userName: formData.userName,
               email: formData.email,
               mobileNumber: formData.mobileNumber,
               role: formData.role,
               status: formData.status,
               image: fileImage[0] || null,
          }

          // Add password for new users
          if (!isEdit && formData.password) {
               userData.password = formData.password
          }

          const success = await onSubmit(data?._id, userData)
          if (success) {
               handleClose()
          }
     }

     const handleClose = () => {
          reset()
          setPreviewImage('')
          setFileImage([])
          onClose()
     }

     return (
          <Dialog
               open={open}
               onClose={handleClose}
               maxWidth="md"
               fullWidth
               PaperProps={{
                    sx: {
                         borderRadius: '16px',
                         maxHeight: '90vh'
                    }
               }}
          >
               <DialogTitle
                    sx={{
                         p: 3,
                         borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                         background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`
                    }}
               >
                    <Box className="flex items-center justify-between">
                         <Box className="flex items-center gap-3">
                              <Box
                                   className="p-2 rounded-lg flex items-center justify-center"
                                   sx={{
                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                        color: theme.palette.primary.main
                                   }}
                              >
                                   <Icon icon={isEdit ? "mdi:account-edit" : "mdi:account-plus"} fontSize={24} />
                              </Box>
                              <Box>
                                   <Typography variant="h5" className="font-semibold">
                                        {isEdit ? 'Edit User' : 'Add New User'}
                                   </Typography>
                                   <Typography variant="body2" color="text.secondary" className="mt-1">
                                        {isEdit ? 'Update user information' : 'Create a new user account'}
                                   </Typography>
                              </Box>
                         </Box>
                         <IconButton onClick={handleClose} disabled={loading}>
                              <Icon icon="mdi:close" />
                         </IconButton>
                    </Box>
               </DialogTitle>

               <form onSubmit={handleSubmit(handleFormSubmit)}>
                    <DialogContent sx={{ p: 3 }}>
                         <Grid container spacing={3}>
                              {/* Profile Picture */}
                              <Grid size={{ xs: 12 }}>
                                   <Box className="flex items-center gap-4">
                                        <Box
                                             className="w-20 h-20 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                                             {...getRootProps()}
                                        >
                                             {previewImage ? (
                                                  <Avatar
                                                       src={previewImage}
                                                       alt="Preview"
                                                       sx={{ width: 80, height: 80 }}
                                                       onError={(e) => {
                                                            e.target.src = '/images/avatars/default-avatar.png'
                                                       }}
                                                  />
                                             ) : (
                                                  <Icon icon="mdi:camera-plus" className="text-2xl text-primary/60" />
                                             )}
                                        </Box>
                                        <Box>
                                             <Button
                                                  variant="outlined"
                                                  component="label"
                                                  size="medium"
                                                  startIcon={<Icon icon="mdi:upload" />}
                                             >
                                                  Upload Image
                                                  <input
                                                       type="file"
                                                       hidden
                                                       accept="image/*"
                                                       {...getInputProps()}
                                                  />
                                             </Button>
                                             {previewImage && (
                                                  <Button
                                                       variant="text"
                                                       color="error"
                                                       size="medium"
                                                       onClick={() => {
                                                            setPreviewImage('')
                                                            setFileImage([])
                                                            setValue('image', null)
                                                       }}
                                                       className="ml-2"
                                                  >
                                                       Remove
                                                  </Button>
                                             )}
                                        </Box>
                                   </Box>
                              </Grid>

                              <Grid size={{ xs: 12 }}>
                                   <Divider />
                              </Grid>

                              {/* First Name */}
                              <Grid size={{ xs: 12, sm: 6 }}>
                                   <Controller
                                        name="firstName"
                                        control={control}
                                        render={({ field }) => (
                                             <TextField
                                                  {...field}
                                                  label="First Name"
                                                  fullWidth
                                                  size="medium"
                                                  error={!!errors.firstName}
                                                  helperText={errors.firstName?.message}
                                                  placeholder="Enter first name"
                                                  disabled={loading}
                                             />
                                        )}
                                   />
                              </Grid>

                              {/* Last Name */}
                              <Grid size={{ xs: 12, sm: 6 }}>
                                   <Controller
                                        name="lastName"
                                        control={control}
                                        render={({ field }) => (
                                             <TextField
                                                  {...field}
                                                  label="Last Name"
                                                  fullWidth
                                                  size="medium"
                                                  error={!!errors.lastName}
                                                  helperText={errors.lastName?.message}
                                                  placeholder="Enter last name"
                                                  disabled={loading}
                                             />
                                        )}
                                   />
                              </Grid>

                              {/* Username */}
                              <Grid size={{ xs: 12, sm: 6 }}>
                                   <Controller
                                        name="userName"
                                        control={control}
                                        render={({ field }) => (
                                             <TextField
                                                  {...field}
                                                  label="Username (Optional)"
                                                  fullWidth
                                                  size="medium"
                                                  error={!!errors.userName}
                                                  helperText={errors.userName?.message}
                                                  placeholder="Enter username"
                                                  disabled={loading}
                                             />
                                        )}
                                   />
                              </Grid>

                              {/* Email */}
                              <Grid size={{ xs: 12, sm: 6 }}>
                                   <Controller
                                        name="email"
                                        control={control}
                                        render={({ field }) => (
                                             <TextField
                                                  {...field}
                                                  label="Email"
                                                  type="email"
                                                  fullWidth
                                                  size="medium"
                                                  error={!!errors.email}
                                                  helperText={errors.email?.message}
                                                  placeholder="Enter email address"
                                                  disabled={loading}
                                             />
                                        )}
                                   />
                              </Grid>

                              {/* Mobile Number */}
                              <Grid size={{ xs: 12, sm: 6 }}>
                                   <Controller
                                        name="mobileNumber"
                                        control={control}
                                        render={({ field }) => (
                                             <TextField
                                                  {...field}
                                                  label="Mobile Number"
                                                  fullWidth
                                                  size="medium"
                                                  error={!!errors.mobileNumber}
                                                  helperText={errors.mobileNumber?.message}
                                                  placeholder="Enter mobile number"
                                                  disabled={loading}
                                             />
                                        )}
                                   />
                              </Grid>

                              {/* Role */}
                              <Grid size={{ xs: 12, sm: 6 }}>
                                   <Controller
                                        name="role"
                                        control={control}
                                        render={({ field }) => (
                                             <FormControl fullWidth size="medium" error={!!errors.role}>
                                                  <InputLabel>Role</InputLabel>
                                                  <Select {...field} label="Role" disabled={loading}>
                                                       {roles.map((role) => (
                                                            <MenuItem key={role.id} value={role.value}>
                                                                 {role.label}
                                                            </MenuItem>
                                                       ))}
                                                  </Select>
                                                  {errors.role && (
                                                       <FormHelperText error>{errors.role.message}</FormHelperText>
                                                  )}
                                             </FormControl>
                                        )}
                                   />
                              </Grid>

                              {/* Status */}
                              <Grid size={{ xs: 12, sm: 6 }}>
                                   <Controller
                                        name="status"
                                        control={control}
                                        render={({ field }) => (
                                             <FormControl fullWidth size="medium" error={!!errors.status}>
                                                  <InputLabel>Status</InputLabel>
                                                  <Select {...field} label="Status" disabled={loading}>
                                                       {userStatusOptions.map((status) => (
                                                            <MenuItem key={status.value} value={status.value}>
                                                                 {status.label}
                                                            </MenuItem>
                                                       ))}
                                                  </Select>
                                                  {errors.status && (
                                                       <FormHelperText error>{errors.status.message}</FormHelperText>
                                                  )}
                                             </FormControl>
                                        )}
                                   />
                              </Grid>

                              {/* Gender */}
                              <Grid size={{ xs: 12, sm: 6 }}>
                                   <Controller
                                        name="gender"
                                        control={control}
                                        render={({ field }) => (
                                             <FormControl fullWidth size="medium" error={!!errors.gender}>
                                                  <InputLabel>Gender</InputLabel>
                                                  <Select {...field} label="Gender" disabled={loading}>
                                                       <MenuItem value="">
                                                            <em>Select Gender</em>
                                                       </MenuItem>
                                                       {genderOptions.map((gender) => (
                                                            <MenuItem key={gender.id} value={gender.id.toString()}>
                                                                 {gender.text}
                                                            </MenuItem>
                                                       ))}
                                                  </Select>
                                                  {errors.gender && (
                                                       <FormHelperText error>{errors.gender.message}</FormHelperText>
                                                  )}
                                             </FormControl>
                                        )}
                                   />
                              </Grid>

                              {/* Password fields only for add mode */}
                              {!isEdit && (
                                   <>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                             <Controller
                                                  name="password"
                                                  control={control}
                                                  render={({ field }) => (
                                                       <TextField
                                                            {...field}
                                                            label="Password"
                                                            type={showPassword ? "text" : "password"}
                                                            fullWidth
                                                            size="medium"
                                                            error={!!errors.password}
                                                            helperText={errors.password?.message}
                                                            placeholder="Enter password"
                                                            disabled={loading}
                                                            InputProps={{
                                                                 endAdornment: (
                                                                      <InputAdornment position="end">
                                                                           <IconButton
                                                                                onClick={() => setShowPassword(!showPassword)}
                                                                                edge="end"
                                                                                size="medium"
                                                                           >
                                                                                <Icon icon={showPassword ? "mdi:eye" : "mdi:eye-off"} />
                                                                           </IconButton>
                                                                      </InputAdornment>
                                                                 ),
                                                            }}
                                                       />
                                                  )}
                                             />
                                        </Grid>

                                        <Grid size={{ xs: 12, sm: 6 }}>
                                             <Controller
                                                  name="confirmPassword"
                                                  control={control}
                                                  render={({ field }) => (
                                                       <TextField
                                                            {...field}
                                                            label="Confirm Password"
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            fullWidth
                                                            size="medium"
                                                            error={!!errors.confirmPassword}
                                                            helperText={errors.confirmPassword?.message}
                                                            placeholder="Confirm password"
                                                            disabled={loading}
                                                            InputProps={{
                                                                 endAdornment: (
                                                                      <InputAdornment position="end">
                                                                           <IconButton
                                                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                                edge="end"
                                                                                size="medium"
                                                                           >
                                                                                <Icon icon={showConfirmPassword ? "mdi:eye" : "mdi:eye-off"} />
                                                                           </IconButton>
                                                                      </InputAdornment>
                                                                 ),
                                                            }}
                                                       />
                                                  )}
                                             />
                                        </Grid>
                                   </>
                              )}
                         </Grid>
                    </DialogContent>

                    <DialogActions
                         sx={{
                              p: 3,
                              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                              gap: 2
                         }}
                    >
                         <Button
                              onClick={handleClose}
                              disabled={loading}
                              variant="outlined"
                              sx={{ borderRadius: '12px' }}
                         >
                              Cancel
                         </Button>
                         <Button
                              type="submit"
                              disabled={loading}
                              variant="contained"
                              startIcon={
                                   loading ? (
                                        <CircularProgress size={20} color="inherit" />
                                   ) : (
                                        <Icon icon={isEdit ? "mdi:content-save" : "mdi:account-plus"} />
                                   )
                              }
                              sx={{ borderRadius: '12px' }}
                         >
                              {loading
                                   ? (isEdit ? 'Updating...' : 'Adding...')
                                   : (isEdit ? 'Update User' : 'Add User')
                              }
                         </Button>
                    </DialogActions>
               </form>
          </Dialog>
     )
}

export default UserDialog
