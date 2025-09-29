'use client'

import { useState, useEffect } from 'react'
import {
     Dialog,
     DialogTitle,
     DialogContent,
     DialogActions,
     Typography,
     Box,
     Button,
     IconButton,
     CircularProgress,
     Avatar,
     Grid,
     Chip,
     Divider,
     Paper,
} from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import { Icon } from '@iconify/react'
import { useSnackbar } from 'notistack'
import { getUserById } from '@/app/(dashboard)/users/actions'
import { userStatusOptions, getFormIcon } from '@/data/dataSets'
import moment from 'moment'

const UserViewDialog = ({ open, onClose, userId }) => {
     const theme = useTheme()
     const { enqueueSnackbar } = useSnackbar()

     // State management
     const [loading, setLoading] = useState(false)
     const [userData, setUserData] = useState(null)

     // Load user data
     const loadUserData = async () => {
          if (!userId) return

          setLoading(true)
          try {
               const result = await getUserById(userId)
               setUserData(result)
          } catch (error) {
               console.error('Error loading user data:', error)
               enqueueSnackbar(error.message || 'Error loading user data', { variant: 'error' })
          } finally {
               setLoading(false)
          }
     }

     // Load data when dialog opens
     useEffect(() => {
          if (open && userId) {
               loadUserData()
          } else if (!open) {
               setUserData(null)
          }
     }, [open, userId])

     const handleClose = () => {
          setUserData(null)
          onClose()
     }

     const statusOption = userStatusOptions.find(opt => opt.value === userData?.status)
     const displayName = userData?.fullname || `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || userData?.userName || 'N/A'

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
                                   <Icon icon={getFormIcon('accountDetails')} fontSize={24} />
                              </Box>
                              <Box>
                                   <Typography variant="h5" className="font-semibold">
                                        User Details
                                   </Typography>
                                   <Typography variant="body2" color="text.secondary" className="mt-1">
                                        View complete user information
                                   </Typography>
                              </Box>
                         </Box>
                         <IconButton onClick={handleClose} disabled={loading}>
                              <Icon icon={getFormIcon('close')} />
                         </IconButton>
                    </Box>
               </DialogTitle>

               <DialogContent sx={{ p: 0 }}>
                    {loading ? (
                         <Box className="flex items-center justify-center py-20">
                              <Box className="text-center">
                                   <CircularProgress size={48} thickness={4} />
                                   <Typography variant="body1" className="mt-4" color="text.secondary">
                                        Loading user details...
                                   </Typography>
                              </Box>
                         </Box>
                    ) : userData ? (
                         <Box className="p-3 flex flex-col items-center justify-center">
                              {/* Profile Section */}
                              <Box
                                   className="mt-3 flex flex-col items-center justify-center"
                                   variant="outlined"
                                   sx={{
                                        p: 3,
                                        mb: 0,
                                        width: '200px',
                                        height: '200px',
                                        borderRadius: '12px',
                                        // textAlign: 'center',
                                        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, transparent 100%)`
                                   }}
                              >
                                   <Avatar
                                        src={userData.image}
                                        alt={displayName}
                                        sx={{
                                             width: 100,
                                             height: 100,
                                             mx: 'auto',
                                             mb: 2,
                                             backgroundColor: theme.palette.primary.main,
                                             fontSize: '2.5rem',
                                             border: `4px solid ${alpha(theme.palette.primary.main, 0.1)}`
                                        }}
                                        onError={(e) => {
                                             e.target.src = '/images/avatars/default-avatar.png'
                                        }}
                                   >
                                        {displayName.charAt(0).toUpperCase()}
                                   </Avatar>

                                   <Typography variant="h5" gutterBottom fontWeight={600}>
                                        {displayName}
                                   </Typography>

                                   <Typography variant="body1" color="text.secondary" gutterBottom>
                                        @{userData.userName || 'N/A'}
                                   </Typography>

                                   <Box className="flex items-center justify-center gap-2">
                                        <Chip
                                             size="small"
                                             variant="tonal"
                                             label={statusOption?.label || userData.status || 'N/A'}
                                             color={statusOption?.color || 'default'}
                                        />
                                        <Chip
                                             size="small"
                                             variant="tonal"
                                             label={userData.role || 'N/A'}
                                             color="primary"
                                        />
                                   </Box>
                              </Box>

                              {/* Personal Information */}
                              <Box
                                   // variant="outlined"
                                   sx={{
                                        p: 4,
                                        borderRadius: '16px',
                                        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(theme.palette.primary.main, 0.01)} 100%)`
                                   }}
                              >
                                   <Box className="flex items-center gap-2 mb-4">
                                        <Box
                                             sx={{
                                                  p: 1,
                                                  borderRadius: '8px',
                                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                  color: theme.palette.primary.main,
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'center'
                                             }}
                                        >
                                             <Icon icon={getFormIcon('accountDetails')} fontSize={20} />
                                        </Box>
                                        <Typography variant="h6" fontWeight={600}>
                                             Personal Information
                                        </Typography>
                                   </Box>
                                   <Divider sx={{ mb: 4 }} />

                                   <Grid container spacing={3}>
                                        {/* First Name */}
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                             <Box className="bg-secondaryLightest"
                                                  sx={{
                                                       p: 2,
                                                       borderRadius: '12px',
                                                       border: `1px solid ${alpha(theme.palette.divider, 0.05)}`
                                                  }}
                                             >
                                                  <Box className="flex items-center gap-2 mb-1.5">
                                                       <Icon icon={getFormIcon('account')} fontSize={18} color={theme.palette.text.secondary} />
                                                       <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                            First Name
                                                       </Typography>
                                                  </Box>
                                                  <Typography variant="body1" color="text.primary" fontWeight={500} className="ml-6">
                                                       {userData.firstName || 'N/A'}
                                                  </Typography>
                                             </Box>
                                        </Grid>

                                        {/* Last Name */}
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                             <Box className="bg-secondaryLightest"
                                                  sx={{
                                                       p: 2,
                                                       borderRadius: '12px',
                                                       border: `1px solid ${alpha(theme.palette.divider, 0.05)}`
                                                  }}
                                             >
                                                  <Box className="flex items-center gap-2 mb-1.5">
                                                       <Icon icon={getFormIcon('account')} fontSize={18} color={theme.palette.text.secondary} />
                                                       <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                            Last Name
                                                       </Typography>
                                                  </Box>
                                                  <Typography variant="body1" color="text.primary" fontWeight={500} className="ml-6">
                                                       {userData.lastName || 'N/A'}
                                                  </Typography>
                                             </Box>
                                        </Grid>

                                        {/* Username */}
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                             <Box className="bg-secondaryLightest"
                                                  sx={{
                                                       p: 2,
                                                       borderRadius: '12px',
                                                       border: `1px solid ${alpha(theme.palette.divider, 0.05)}`
                                                  }}
                                             >
                                                  <Box className="flex items-center gap-2 mb-1.5">
                                                       <Icon icon={getFormIcon('at')} fontSize={18} color={theme.palette.text.secondary} />
                                                       <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                            Username
                                                       </Typography>
                                                  </Box>
                                                  <Typography variant="body1" color="text.primary" fontWeight={500} className="ml-6">
                                                       @{userData.userName || 'N/A'}
                                                  </Typography>
                                             </Box>
                                        </Grid>

                                        {/* Email */}
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                             <Box className="bg-secondaryLightest"
                                                  sx={{
                                                       p: 2,
                                                       borderRadius: '12px',
                                                       border: `1px solid ${alpha(theme.palette.divider, 0.05)}`
                                                  }}
                                             >
                                                  <Box className="flex items-center gap-2 mb-1.5">
                                                       <Icon icon={getFormIcon('email')} fontSize={18} color={theme.palette.text.secondary} />
                                                       <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                            Email
                                                       </Typography>
                                                  </Box>
                                                  <Typography
                                                       variant="body1"
                                                       color="text.primary"
                                                       fontWeight={500}
                                                       className="ml-6"
                                                       sx={{
                                                            wordBreak: 'break-all',
                                                            fontSize: '0.9rem'
                                                       }}
                                                  >
                                                       {userData.email || 'N/A'}
                                                  </Typography>
                                             </Box>
                                        </Grid>

                                        {/* Phone Number */}
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                             <Box className="bg-secondaryLightest"
                                                  sx={{
                                                       p: 2,
                                                       borderRadius: '12px',
                                                       border: `1px solid ${alpha(theme.palette.divider, 0.05)}`
                                                  }}
                                             >
                                                  <Box className="flex items-center gap-2 mb-1.5">
                                                       <Icon icon={getFormIcon('phone')} fontSize={18} color={theme.palette.text.secondary} />
                                                       <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                            Phone Number
                                                       </Typography>
                                                  </Box>
                                                  <Typography variant="body1" color="text.primary" fontWeight={500} className="ml-6">
                                                       {userData.mobileNumber || 'N/A'}
                                                  </Typography>
                                             </Box>
                                        </Grid>

                                        {/* Gender */}
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                             <Box className="bg-secondaryLightest"
                                                  sx={{
                                                       p: 2,
                                                       borderRadius: '12px',
                                                       border: `1px solid ${alpha(theme.palette.divider, 0.05)}`
                                                  }}
                                             >
                                                  <Box className="flex items-center gap-2 mb-1.5">
                                                       <Icon icon={getFormIcon('genderMaleFemale')} fontSize={18} color={theme.palette.text.secondary} />
                                                       <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                            Gender
                                                       </Typography>
                                                  </Box>
                                                  <Typography variant="body1" color="text.primary" fontWeight={500} className="ml-6">
                                                       {userData.gender === '2' ? 'Male' : userData.gender === '3' ? 'Female' : userData.gender || 'N/A'}
                                                  </Typography>
                                             </Box>
                                        </Grid>

                                        {/* Role */}
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                             <Box className="bg-secondaryLightest"
                                                  sx={{
                                                       p: 2,
                                                       borderRadius: '12px',
                                                       border: `1px solid ${alpha(theme.palette.divider, 0.05)}`
                                                  }}
                                             >
                                                  <Box className="flex items-center gap-2 mb-2">
                                                       <Icon icon={getFormIcon('shieldAccount')} fontSize={18} color={theme.palette.primary.main} />
                                                       <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                            Role
                                                       </Typography>
                                                  </Box>
                                                  <Box className="ml-6">
                                                       <Chip
                                                            size="medium"
                                                            variant="tonal"
                                                            label={userData.role || 'N/A'}
                                                            color="primary"
                                                            sx={{ fontWeight: 600 }}
                                                       />
                                                  </Box>
                                             </Box>
                                        </Grid>

                                        {/* Status */}
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                             <Box className="bg-secondaryLightest"
                                                  sx={{
                                                       p: 2,
                                                       borderRadius: '12px',
                                                       border: `1px solid ${alpha(theme.palette.divider, 0.05)}`
                                                  }}
                                             >
                                                  <Box className="flex items-center gap-2 mb-2">
                                                       <Icon icon={getFormIcon('checkCircle')} fontSize={18} color='text.secondary' />
                                                       <Typography variant="caption" color='text.secondary' fontWeight={600}>
                                                            Status
                                                       </Typography>
                                                  </Box>
                                                  <Box className="ml-6">
                                                       <Chip
                                                            size="medium"
                                                            variant="tonal"
                                                            label={statusOption?.label || userData.status || 'N/A'}
                                                            color={statusOption?.color || 'default'}
                                                            sx={{ fontWeight: 600 }}
                                                       />
                                                  </Box>
                                             </Box>
                                        </Grid>

                                        {/* Date of Birth */}
                                        {userData.DOB && (
                                             <Grid size={{ xs: 12, sm: 6 }}>
                                                  <Box className="bg-secondaryLightest"
                                                       sx={{
                                                            p: 2,
                                                            borderRadius: '12px',
                                                            border: `1px solid ${alpha(theme.palette.divider, 0.05)}`
                                                       }}
                                                  >
                                                       <Box className="flex items-center gap-2 mb-1.5">
                                                            <Icon icon={getFormIcon('cakeVariant')} fontSize={18} color={theme.palette.text.secondary} />
                                                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                                 Date of Birth
                                                            </Typography>
                                                       </Box>
                                                       <Typography variant="body1" color="text.primary" fontWeight={500} className="ml-6">
                                                            {moment(userData.DOB).format('DD MMM YYYY')}
                                                       </Typography>
                                                  </Box>
                                             </Grid>
                                        )}

                                        {/* Created Date */}
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                             <Box className="bg-secondaryLightest"
                                                  sx={{
                                                       p: 2,
                                                       borderRadius: '12px',
                                                       border: `1px solid ${alpha(theme.palette.divider, 0.05)}`
                                                  }}
                                             >
                                                  <Box className="flex items-center gap-2 mb-1.5">
                                                       <Icon icon={getFormIcon('calendarPlus')} fontSize={18} color={theme.palette.text.secondary} />
                                                       <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                            Created Date
                                                       </Typography>
                                                  </Box>
                                                  <Typography variant="body2" color="text.primary" fontWeight={500} className="ml-6">
                                                       {userData.createdAt ? moment(userData.createdAt).format('DD MMM YYYY, hh:mm A') : 'N/A'}
                                                  </Typography>
                                             </Box>
                                        </Grid>

                                        {/* Last Updated */}
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                             <Box className="bg-secondaryLightest"
                                                  sx={{
                                                       p: 2,
                                                       borderRadius: '12px',
                                                       border: `1px solid ${alpha(theme.palette.divider, 0.05)}`
                                                  }}
                                             >
                                                  <Box className="flex items-center gap-2 mb-1.5">
                                                       <Icon icon={getFormIcon('update')} fontSize={18} color={theme.palette.text.secondary} />
                                                       <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                            Last Updated
                                                       </Typography>
                                                  </Box>
                                                  <Typography variant="body2" color="text.primary" fontWeight={500} className="ml-6">
                                                       {userData.updatedAt ? moment(userData.updatedAt).format('DD MMM YYYY, hh:mm A') : 'N/A'}
                                                  </Typography>
                                             </Box>
                                        </Grid>

                                        {/* Address */}
                                        {userData.addressInformation && (
                                             <Grid size={{ xs: 12 }}>
                                                  <Box className="bg-secondaryLightest"
                                                       sx={{
                                                            p: 2,
                                                            borderRadius: '12px',
                                                            border: `1px solid ${alpha(theme.palette.divider, 0.05)}`
                                                       }}
                                                  >
                                                       <Box className="flex items-center gap-2 mb-1.5">
                                                            <Icon icon={getFormIcon('mapMarker')} fontSize={18} color={theme.palette.text.secondary} />
                                                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                                 Address
                                                            </Typography>
                                                       </Box>
                                                       <Typography variant="body1" color="text.primary" fontWeight={500} className="ml-6">
                                                            {[userData.addressInformation.address, userData.addressInformation.city, userData.addressInformation.state, userData.addressInformation.country]
                                                                 .filter(Boolean)
                                                                 .join(', ') || 'N/A'}
                                                       </Typography>
                                                  </Box>
                                             </Grid>
                                        )}
                                   </Grid>
                              </Box>
                         </Box>
                    ) : (
                         <Box className="flex items-center justify-center py-20">
                              <Typography variant="body1" color="text.secondary">
                                   No user data available
                              </Typography>
                         </Box>
                    )}
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
                         variant="contained"
                         sx={{ borderRadius: '12px' }}
                    >
                         Close
                    </Button>
               </DialogActions>
          </Dialog>
     )
}

export default UserViewDialog
