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
import { useState } from 'react'

const CustomerSecurity = ({ customerData }) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Grid container spacing={6}>
      {/* Change Password */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Change Password' />
          <CardContent>
            <Grid container spacing={6}>
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
                {/* Empty grid for spacing */}
              </Grid>
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12}>
                <Button variant='contained'>Change Password</Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Two Factor Authentication */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Two Factor Authentication' />
          <CardContent>
            <div className='flex flex-col gap-4'>
              <FormControlLabel
                control={<Switch />}
                label='Enable Two Factor Authentication'
              />
              <Typography variant='body2' color='text.secondary'>
                Two factor authentication adds an extra layer of security to your account. 
                To log in, in addition you'll need to provide a 6 digit code
              </Typography>
              <Button variant='outlined' className='self-start'>
                Setup Authenticator
              </Button>
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default CustomerSecurity