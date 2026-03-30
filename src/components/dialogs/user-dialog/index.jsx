'use client'

import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
     Avatar,
     Box,
     Button,
     Dialog,
     DialogActions,
     DialogContent,
     DialogTitle,
     Divider,
     FormControl,
     FormHelperText,
     Grid,
     IconButton,
     InputAdornment,
     InputLabel,
     MenuItem,
     Select,
     TextField,
     Typography
} from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import { Icon } from '@iconify/react'
import { useDropzone } from 'react-dropzone'
import { userValidationRules, userStatusOptions, genderOptions } from '@/data/dataSets'

const companyRoleOptions = [
     { value: 'OWNER', label: 'Owner' },
     { value: 'COMPANY_ADMIN', label: 'Company Admin' },
     { value: 'COMPANY_MEMBER', label: 'Company Member' }
]

const branchRoleOptions = [
     { value: 'STORE_ADMIN', label: 'Store Admin' },
     { value: 'STORE_MANAGER', label: 'Store Manager' },
     { value: 'STORE_STAFF', label: 'Store Staff' }
]

const getSchema = isEdit =>
     yup.object().shape({
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
               .required(userValidationRules.userName.required)
               .min(3, userValidationRules.userName.minLength.message)
               .max(30, userValidationRules.userName.maxLength.message)
               .matches(/^[a-zA-Z0-9_]*$/, userValidationRules.userName.pattern.message),
          email: yup
               .string()
               .required(userValidationRules.email.required)
               .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, userValidationRules.email.pattern.message),
          mobileNumber: yup
               .string()
               .optional()
               .matches(/^[\+]?[0-9\-\(\)\s]*$/, userValidationRules.mobileNumber.pattern.message),
          role: yup.string().required(userValidationRules.role.required),
          companyRole: yup.string().required('Company role is required'),
          assignedBranchIds: yup.array().of(yup.string()).default([]),
          primaryBranchId: yup.string().nullable().default(''),
          branchRole: yup.string().when('assignedBranchIds', {
               is: value => Array.isArray(value) && value.length > 0,
               then: schema => schema.required('Store role is required when stores are assigned'),
               otherwise: schema => schema.optional().nullable()
          }),
          status: yup.string().required(userValidationRules.status.required),
          gender: yup.string().optional(),
          password: isEdit
               ? yup.string().optional()
               : yup
                    .string()
                    .required(userValidationRules.password.required)
                    .min(8, userValidationRules.password.minLength.message)
                    .matches(
                         /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                         userValidationRules.password.pattern.message
                    ),
          confirmPassword: isEdit
               ? yup.string().optional()
               : yup
                    .string()
                    .required('Confirm password is required')
                    .oneOf([yup.ref('password'), null], 'Passwords must match')
     })

const defaultValues = {
     firstName: '',
     lastName: '',
     userName: '',
     email: '',
     mobileNumber: '',
     role: '',
     companyRole: 'COMPANY_MEMBER',
     assignedBranchIds: [],
     primaryBranchId: '',
     branchRole: '',
     password: '',
     confirmPassword: '',
     status: 'Active',
     gender: ''
}

const UserDialog = ({ open, onClose, data, onSubmit, loading, roles = [], branches = [] }) => {
     const theme = useTheme()
     const isEdit = !!data?._id
     const [fileImage, setFileImage] = useState([])
     const [previewImage, setPreviewImage] = useState('')
     const [imageRemoved, setImageRemoved] = useState(false)
     const [showPassword, setShowPassword] = useState(false)
     const [showConfirmPassword, setShowConfirmPassword] = useState(false)

     const {
          control,
          handleSubmit,
          setValue,
          reset,
          watch,
          formState: { errors }
     } = useForm({
          resolver: yupResolver(getSchema(isEdit)),
          defaultValues
     })

     const watchedAssignedBranchIds = watch('assignedBranchIds') || []
     const watchedPrimaryBranchId = watch('primaryBranchId')

     const branchOptions = useMemo(
          () =>
               (branches || []).map(branch => ({
                    id: branch._id || branch.id,
                    label:
                         [branch.storeCode, branch.name]
                              .filter(Boolean)
                              .join(' · ') || branch.name || branch.branchId || 'Store',
                    raw: branch
               })),
          [branches]
     )

     const selectedBranchLabels = useMemo(
          () =>
               branchOptions
                    .filter(branch => watchedAssignedBranchIds.includes(branch.id))
                    .map(branch => branch.label),
          [branchOptions, watchedAssignedBranchIds]
     )

     const { getRootProps, getInputProps } = useDropzone({
          maxFiles: 1,
          accept: {
               'image/*': ['.jpeg', '.jpg', '.png', '.gif']
          },
          onDrop: acceptedFiles => {
               setFileImage(acceptedFiles)
               setImageRemoved(false)
               getBase64(acceptedFiles?.[0]).then(result => {
                    setPreviewImage(result)
                    setValue('image', acceptedFiles?.[0])
               })
          }
     })

     const getBase64 = file =>
          new Promise(resolve => {
               let reader = new FileReader()
               reader.readAsDataURL(file)
               reader.onload = () => resolve(reader.result)
          })

     useEffect(() => {
          if (!open) return

          if (data) {
               reset({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    userName: data.userName || '',
                    email: data.email || '',
                    mobileNumber: data.mobileNumber || '',
                    role: data.role || '',
                    companyRole: data.companyRole || data.orgRole || 'COMPANY_MEMBER',
                    assignedBranchIds: data.assignedBranchIds || [],
                    primaryBranchId: data.primaryBranchId || data.assignedBranchIds?.[0] || '',
                    branchRole: data.branchRoles?.[0] || '',
                    password: '',
                    confirmPassword: '',
                    status: data.status || 'Active',
                    gender: data.gender || ''
               })
               setPreviewImage(data.image || '')
               setFileImage([])
               setImageRemoved(false)
          } else {
               reset(defaultValues)
               setPreviewImage('')
               setFileImage([])
               setImageRemoved(false)
          }
     }, [open, data, reset])

     useEffect(() => {
          if (watchedAssignedBranchIds.length === 0) {
               setValue('branchRole', '')
               setValue('primaryBranchId', '')
          }

          if (
               watchedAssignedBranchIds.length > 0 &&
               !watchedAssignedBranchIds.includes(watchedPrimaryBranchId)
          ) {
               setValue('primaryBranchId', watchedAssignedBranchIds[0])
          }
     }, [watchedAssignedBranchIds, watchedPrimaryBranchId, setValue])

     const handleFormSubmit = async formData => {
          const selectedRole = roles.find(role => role.value === formData.role)
          const resolvedImage =
               fileImage[0] || (imageRemoved ? null : isEdit ? undefined : null)
          const userData = {
               firstName: formData.firstName,
               lastName: formData.lastName,
               userName: formData.userName,
               email: formData.email,
               mobileNumber: formData.mobileNumber,
               role: formData.role,
               roleId: selectedRole?.id || '',
               companyRole: formData.companyRole,
               assignedBranchIds: formData.assignedBranchIds || [],
               primaryBranchId: formData.primaryBranchId || '',
               branchRole: formData.branchRole || '',
               status: formData.status,
               gender: formData.gender,
               image: resolvedImage,
               imageRemoved
          }

          if (!isEdit && formData.password) {
               userData.password = formData.password
          }

          const success = await onSubmit(data?._id, userData)
          if (success) {
               handleClose()
          }
     }

     const handleClose = () => {
          reset(defaultValues)
          setPreviewImage('')
          setFileImage([])
          setImageRemoved(false)
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
                                   <Icon icon={isEdit ? 'mdi:account-edit' : 'mdi:account-plus'} fontSize={24} />
                              </Box>
                              <Box>
                                   <Typography variant="h5" className="font-semibold">
                                        {isEdit ? 'Edit Team Member' : 'Add Team Member'}
                                   </Typography>
                                   <Typography variant="body2" color="text.secondary" className="mt-1">
                                        Configure company role, permission role, and assigned stores.
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
                              <Grid size={{ xs: 12 }}>
                                   <Box className="flex items-center gap-4">
                                        <Box
                                             className="w-20 h-20 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                                             {...getRootProps()}
                                        >
                                             {previewImage ? (
                                                  <Avatar src={previewImage} alt="Preview" sx={{ width: 80, height: 80 }} />
                                             ) : (
                                                  <Icon icon="mdi:camera-plus" className="text-2xl text-primary/60" />
                                             )}
                                        </Box>
                                        <Box>
                                             <Button
                                                  variant="outlined"
                                                  component="label"
                                                  startIcon={<Icon icon="mdi:upload" />}
                                             >
                                                  Upload Image
                                                  <input type="file" hidden accept="image/*" {...getInputProps()} />
                                             </Button>
                                             {previewImage && (
                                                  <Button
                                                       variant="text"
                                                       color="error"
                                                       onClick={() => {
                                                            setPreviewImage('')
                                                            setFileImage([])
                                                            setImageRemoved(true)
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

                              <Grid size={{ xs: 12, sm: 6 }}>
                                   <Controller
                                        name="firstName"
                                        control={control}
                                        render={({ field }) => (
                                             <TextField {...field} label="First Name" fullWidth error={!!errors.firstName} helperText={errors.firstName?.message} disabled={loading} />
                                        )}
                                   />
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                   <Controller
                                        name="lastName"
                                        control={control}
                                        render={({ field }) => (
                                             <TextField {...field} label="Last Name" fullWidth error={!!errors.lastName} helperText={errors.lastName?.message} disabled={loading} />
                                        )}
                                   />
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                   <Controller
                                        name="userName"
                                        control={control}
                                        render={({ field }) => (
                                             <TextField {...field} label="Username" fullWidth error={!!errors.userName} helperText={errors.userName?.message} disabled={loading} />
                                        )}
                                   />
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                   <Controller
                                        name="email"
                                        control={control}
                                        render={({ field }) => (
                                             <TextField {...field} label="Email" type="email" fullWidth error={!!errors.email} helperText={errors.email?.message} disabled={loading} />
                                        )}
                                   />
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                   <Controller
                                        name="mobileNumber"
                                        control={control}
                                        render={({ field }) => (
                                             <TextField {...field} label="Mobile Number" fullWidth error={!!errors.mobileNumber} helperText={errors.mobileNumber?.message} disabled={loading} />
                                        )}
                                   />
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                   <Controller
                                        name="gender"
                                        control={control}
                                        render={({ field }) => (
                                             <FormControl fullWidth error={!!errors.gender}>
                                                  <InputLabel>Gender</InputLabel>
                                                  <Select {...field} label="Gender" disabled={loading}>
                                                       <MenuItem value="">
                                                            <em>Select Gender</em>
                                                       </MenuItem>
                                                       {genderOptions.map(gender => (
                                                            <MenuItem key={gender.id} value={gender.id.toString()}>
                                                                 {gender.text}
                                                            </MenuItem>
                                                       ))}
                                                  </Select>
                                                  {errors.gender && <FormHelperText>{errors.gender.message}</FormHelperText>}
                                             </FormControl>
                                        )}
                                   />
                              </Grid>

                              <Grid size={{ xs: 12 }}>
                                   <Divider />
                              </Grid>

                              <Grid size={{ xs: 12, sm: 6 }}>
                                   <Controller
                                        name="role"
                                        control={control}
                                        render={({ field }) => (
                                             <FormControl fullWidth error={!!errors.role}>
                                                  <InputLabel>Permission Role</InputLabel>
                                                  <Select {...field} label="Permission Role" disabled={loading}>
                                                       {roles.map(role => (
                                                            <MenuItem key={role.id || role.value} value={role.value}>
                                                                 {role.label}
                                                            </MenuItem>
                                                       ))}
                                                  </Select>
                                                  {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
                                             </FormControl>
                                        )}
                                   />
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                   <Controller
                                        name="companyRole"
                                        control={control}
                                        render={({ field }) => (
                                             <FormControl fullWidth error={!!errors.companyRole}>
                                                  <InputLabel>Company Role</InputLabel>
                                                  <Select
                                                       {...field}
                                                       label="Company Role"
                                                       disabled={loading || data?.companyRole === 'OWNER'}
                                                  >
                                                       {companyRoleOptions.map(companyRole => (
                                                            <MenuItem
                                                                 key={companyRole.value}
                                                                 value={companyRole.value}
                                                                 disabled={companyRole.value === 'OWNER' && data?.companyRole !== 'OWNER'}
                                                            >
                                                                 {companyRole.label}
                                                            </MenuItem>
                                                       ))}
                                                  </Select>
                                                  {errors.companyRole && <FormHelperText>{errors.companyRole.message}</FormHelperText>}
                                             </FormControl>
                                        )}
                                   />
                              </Grid>

                              <Grid size={{ xs: 12 }}>
                                   <Typography variant="subtitle2" color="text.secondary">
                                        Assigned Stores
                                   </Typography>
                                   <Typography variant="body2" color="text.secondary">
                                        Leave this empty for a company-wide account. Assign one or more stores for store-scoped users.
                                   </Typography>
                              </Grid>

                              <Grid size={{ xs: 12, md: 6 }}>
                                   <Controller
                                        name="assignedBranchIds"
                                        control={control}
                                        render={({ field }) => (
                                             <FormControl fullWidth error={!!errors.assignedBranchIds}>
                                                  <InputLabel>Stores</InputLabel>
                                                  <Select
                                                       {...field}
                                                       multiple
                                                       label="Stores"
                                                       disabled={loading}
                                                       value={field.value || []}
                                                       renderValue={selected =>
                                                            branchOptions
                                                                 .filter(branch => selected.includes(branch.id))
                                                                 .map(branch => branch.label)
                                                                 .join(', ')
                                                       }
                                                  >
                                                       {branchOptions.map(branch => (
                                                            <MenuItem key={branch.id} value={branch.id}>
                                                                 {branch.label}
                                                            </MenuItem>
                                                       ))}
                                                  </Select>
                                                  {errors.assignedBranchIds && (
                                                       <FormHelperText>{errors.assignedBranchIds.message}</FormHelperText>
                                                  )}
                                             </FormControl>
                                        )}
                                   />
                              </Grid>
                              <Grid size={{ xs: 12, md: 3 }}>
                                   <Controller
                                        name="primaryBranchId"
                                        control={control}
                                        render={({ field }) => (
                                             <FormControl fullWidth error={!!errors.primaryBranchId}>
                                                  <InputLabel>Primary Store</InputLabel>
                                                  <Select {...field} label="Primary Store" disabled={loading || watchedAssignedBranchIds.length === 0}>
                                                       {branchOptions
                                                            .filter(branch => watchedAssignedBranchIds.includes(branch.id))
                                                            .map(branch => (
                                                                 <MenuItem key={branch.id} value={branch.id}>
                                                                      {branch.label}
                                                                 </MenuItem>
                                                            ))}
                                                  </Select>
                                                  {errors.primaryBranchId && <FormHelperText>{errors.primaryBranchId.message}</FormHelperText>}
                                             </FormControl>
                                        )}
                                   />
                              </Grid>
                              <Grid size={{ xs: 12, md: 3 }}>
                                   <Controller
                                        name="branchRole"
                                        control={control}
                                        render={({ field }) => (
                                             <FormControl fullWidth error={!!errors.branchRole}>
                                                  <InputLabel>Store Role</InputLabel>
                                                  <Select {...field} label="Store Role" disabled={loading || watchedAssignedBranchIds.length === 0}>
                                                       {branchRoleOptions.map(role => (
                                                            <MenuItem key={role.value} value={role.value}>
                                                                 {role.label}
                                                            </MenuItem>
                                                       ))}
                                                  </Select>
                                                  {errors.branchRole && <FormHelperText>{errors.branchRole.message}</FormHelperText>}
                                             </FormControl>
                                        )}
                                   />
                              </Grid>

                              <Grid size={{ xs: 12, sm: 6 }}>
                                   <Controller
                                        name="status"
                                        control={control}
                                        render={({ field }) => (
                                             <FormControl fullWidth error={!!errors.status}>
                                                  <InputLabel>Status</InputLabel>
                                                  <Select {...field} label="Status" disabled={loading}>
                                                       {userStatusOptions.map(status => (
                                                            <MenuItem key={status.value} value={status.value}>
                                                                 {status.label}
                                                            </MenuItem>
                                                       ))}
                                                  </Select>
                                                  {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                                             </FormControl>
                                        )}
                                   />
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                   <TextField
                                        value={selectedBranchLabels.join(', ') || 'No stores assigned'}
                                        label="Store Summary"
                                        fullWidth
                                        disabled
                                   />
                              </Grid>

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
                                                            type={showPassword ? 'text' : 'password'}
                                                            fullWidth
                                                            error={!!errors.password}
                                                            helperText={errors.password?.message}
                                                            disabled={loading}
                                                            InputProps={{
                                                                 endAdornment: (
                                                                      <InputAdornment position="end">
                                                                           <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                                                <Icon icon={showPassword ? 'mdi:eye' : 'mdi:eye-off'} />
                                                                           </IconButton>
                                                                      </InputAdornment>
                                                                 )
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
                                                            type={showConfirmPassword ? 'text' : 'password'}
                                                            fullWidth
                                                            error={!!errors.confirmPassword}
                                                            helperText={errors.confirmPassword?.message}
                                                            disabled={loading}
                                                            InputProps={{
                                                                 endAdornment: (
                                                                      <InputAdornment position="end">
                                                                           <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                                                                                <Icon icon={showConfirmPassword ? 'mdi:eye' : 'mdi:eye-off'} />
                                                                           </IconButton>
                                                                      </InputAdornment>
                                                                 )
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
                         <Button onClick={handleClose} color="secondary" disabled={loading}>
                              Cancel
                         </Button>
                         <Button type="submit" variant="contained" disabled={loading}>
                              {isEdit ? 'Update User' : 'Create User'}
                         </Button>
                    </DialogActions>
               </form>
          </Dialog>
     )
}

export default UserDialog
