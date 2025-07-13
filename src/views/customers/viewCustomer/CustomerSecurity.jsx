// React Imports
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Divider from '@mui/material/Divider'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

const CustomerSecurity = ({ customerData }) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Grid container spacing={6}>
      {/* Change Password */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader 
            title={
              <div className='flex items-center gap-3'>
                <CustomAvatar variant='rounded' skin='light' color='primary' size={40}>
                  <i className='ri-lock-password-line' />
                </CustomAvatar>
                <div>
                  <Typography variant='h6' className='font-semibold'>
                    Change Password
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Update the password for {customerData?.name || 'this customer'}
                  </Typography>
                </div>
              </div>
            }
          />
          <Divider />
          <CardContent className='flex flex-col gap-6'>
            <Alert severity='warning' icon={false}>
              <AlertTitle className='font-semibold'>Password Requirements</AlertTitle>
              <Typography variant='body2'>
                Password must be at least 8 characters long and include uppercase letters, lowercase letters, and special characters.
              </Typography>
            </Alert>
            
            <Grid container spacing={6}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Current Password</InputLabel>
                  <OutlinedInput
                    label='Current Password'
                    type={showPassword ? 'text' : 'password'}
                    endAdornment={
                      <InputAdornment position='end'>
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge='end'>
                          <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {/* Empty grid for spacing */}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>New Password</InputLabel>
                  <OutlinedInput
                    label='New Password'
                    type={showPassword ? 'text' : 'password'}
                    endAdornment={
                      <InputAdornment position='end'>
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge='end'>
                          <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Confirm New Password</InputLabel>
                  <OutlinedInput
                    label='Confirm New Password'
                    type={showPassword ? 'text' : 'password'}
                    endAdornment={
                      <InputAdornment position='end'>
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge='end'>
                          <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <div className='flex gap-4'>
                  <Button variant='contained' startIcon={<i className='ri-save-line' />}>
                    Change Password
                  </Button>
                  <Button variant='outlined' color='secondary'>
                    Cancel
                  </Button>
                </div>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Two Factor Authentication */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader 
            title={
              <div className='flex items-center gap-3'>
                <CustomAvatar variant='rounded' skin='light' color='success' size={40}>
                  <i className='ri-shield-check-line' />
                </CustomAvatar>
                <div>
                  <Typography variant='h6' className='font-semibold'>
                    Two Factor Authentication
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Add an extra layer of security to the account
                  </Typography>
                </div>
              </div>
            }
          />
          <Divider />
          <CardContent className='flex flex-col gap-6'>
            <Alert severity='info' icon={false}>
              <AlertTitle className='font-semibold'>Enhanced Security</AlertTitle>
              <Typography variant='body2'>
                Two-factor authentication adds an extra layer of security by requiring a verification code in addition to the password.
              </Typography>
            </Alert>

            <div className='flex flex-col gap-4'>
              <FormControlLabel
                control={<Switch />}
                label={
                  <div className='pli-2'>
                    <Typography variant='body1' className='font-semibold'>
                      Enable Two Factor Authentication
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Use authenticator app or SMS for verification codes
                    </Typography>
                  </div>
                }
              />
              
              <div className='pli-8 pbs-4 border-bs'>
                <Typography variant='body2' color='text.secondary' className='mb-4'>
                  Authentication methods available:
                </Typography>
                <div className='flex flex-col gap-3'>
                  <div className='flex items-center gap-3 p-3 border rounded-lg'>
                    <CustomAvatar variant='rounded' skin='light' color='info' size={32}>
                      <i className='ri-smartphone-line' />
                    </CustomAvatar>
                    <div className='flex-grow'>
                      <Typography variant='body2' className='font-medium'>
                        Authenticator App
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Use Google Authenticator or similar apps
                      </Typography>
                    </div>
                    <Button variant='outlined' size='small'>
                      Setup
                    </Button>
                  </div>
                  
                  <div className='flex items-center gap-3 p-3 border rounded-lg'>
                    <CustomAvatar variant='rounded' skin='light' color='warning' size={32}>
                      <i className='ri-message-2-line' />
                    </CustomAvatar>
                    <div className='flex-grow'>
                      <Typography variant='body2' className='font-medium'>
                        SMS Verification
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Receive codes via text message
                      </Typography>
                    </div>
                    <Button variant='outlined' size='small'>
                      Setup
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Login Activity */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader 
            title={
              <div className='flex items-center gap-3'>
                <CustomAvatar variant='rounded' skin='light' color='warning' size={40}>
                  <i className='ri-history-line' />
                </CustomAvatar>
                <div>
                  <Typography variant='h6' className='font-semibold'>
                    Recent Login Activity
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Monitor account access and login attempts
                  </Typography>
                </div>
              </div>
            }
          />
          <Divider />
          <CardContent>
            <div className='flex flex-col items-center gap-4 py-8'>
              <CustomAvatar variant='rounded' skin='light' color='secondary' size={64}>
                <i className='ri-time-line text-3xl' />
              </CustomAvatar>
              <div className='text-center'>
                <Typography variant='h6' color='text.secondary' className='font-semibold'>
                  No recent activity
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Login activity will appear here once the customer accesses their account.
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default CustomerSecurity