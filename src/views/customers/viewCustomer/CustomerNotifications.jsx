// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

const CustomerNotifications = ({ customerData }) => {
  return (
    <Card>
      <CardHeader 
        title={
          <Typography variant='h6' className='font-semibold'>
            Notification Preferences
          </Typography>
        }
        subheader={
          <Typography variant='body2' color='text.secondary'>
            Manage how {customerData?.name || 'this customer'} receives notifications
          </Typography>
        }
      />
      <Divider />
      <CardContent>
        <Grid container spacing={6}>
          {/* Email Notifications */}
          <Grid size={{ xs: 12, md: 4 }}>
            <div className='flex flex-col gap-4'>
              <div className='flex items-center gap-3 mb-2'>
                <CustomAvatar variant='rounded' skin='light' color='primary' size={40}>
                  <i className='ri-mail-line' />
                </CustomAvatar>
                <div>
                  <Typography variant='h6' className='font-semibold'>
                    Email Notifications
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Email updates and alerts
                  </Typography>
                </div>
              </div>
              <div className='flex flex-col gap-3 pli-[52px]'>
                <FormControlLabel
                  control={<Switch defaultChecked size='small' />}
                  label={
                    <div>
                      <Typography variant='body2' className='font-medium'>
                        Order confirmations
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Send email when orders are placed
                      </Typography>
                    </div>
                  }
                />
                <FormControlLabel
                  control={<Switch defaultChecked size='small' />}
                  label={
                    <div>
                      <Typography variant='body2' className='font-medium'>
                        Order status updates
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Notify about order status changes
                      </Typography>
                    </div>
                  }
                />
                <FormControlLabel
                  control={<Switch size='small' />}
                  label={
                    <div>
                      <Typography variant='body2' className='font-medium'>
                        Payment reminders
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Send payment due reminders
                      </Typography>
                    </div>
                  }
                />
                <FormControlLabel
                  control={<Switch size='small' />}
                  label={
                    <div>
                      <Typography variant='body2' className='font-medium'>
                        Marketing emails
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Promotional offers and updates
                      </Typography>
                    </div>
                  }
                />
                <FormControlLabel
                  control={<Switch defaultChecked size='small' />}
                  label={
                    <div>
                      <Typography variant='body2' className='font-medium'>
                        Security alerts
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Important security notifications
                      </Typography>
                    </div>
                  }
                />
              </div>
            </div>
          </Grid>

          {/* SMS Notifications */}
          <Grid size={{ xs: 12, md: 4 }}>
            <div className='flex flex-col gap-4'>
              <div className='flex items-center gap-3 mb-2'>
                <CustomAvatar variant='rounded' skin='light' color='success' size={40}>
                  <i className='ri-message-2-line' />
                </CustomAvatar>
                <div>
                  <Typography variant='h6' className='font-semibold'>
                    SMS Notifications
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Text message alerts
                  </Typography>
                </div>
              </div>
              <div className='flex flex-col gap-3 pli-[52px]'>
                <FormControlLabel
                  control={<Switch size='small' />}
                  label={
                    <div>
                      <Typography variant='body2' className='font-medium'>
                        Order confirmations
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        SMS when orders are placed
                      </Typography>
                    </div>
                  }
                />
                <FormControlLabel
                  control={<Switch size='small' />}
                  label={
                    <div>
                      <Typography variant='body2' className='font-medium'>
                        Delivery updates
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Track delivery status via SMS
                      </Typography>
                    </div>
                  }
                />
                <FormControlLabel
                  control={<Switch defaultChecked size='small' />}
                  label={
                    <div>
                      <Typography variant='body2' className='font-medium'>
                        Security alerts
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Critical security notifications
                      </Typography>
                    </div>
                  }
                />
              </div>
            </div>
          </Grid>

          {/* Push Notifications */}
          <Grid size={{ xs: 12, md: 4 }}>
            <div className='flex flex-col gap-4'>
              <div className='flex items-center gap-3 mb-2'>
                <CustomAvatar variant='rounded' skin='light' color='warning' size={40}>
                  <i className='ri-notification-2-line' />
                </CustomAvatar>
                <div>
                  <Typography variant='h6' className='font-semibold'>
                    Push Notifications
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    App and browser alerts
                  </Typography>
                </div>
              </div>
              <div className='flex flex-col gap-3 pli-[52px]'>
                <FormControlLabel
                  control={<Switch defaultChecked size='small' />}
                  label={
                    <div>
                      <Typography variant='body2' className='font-medium'>
                        Order updates
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Real-time order notifications
                      </Typography>
                    </div>
                  }
                />
                <FormControlLabel
                  control={<Switch size='small' />}
                  label={
                    <div>
                      <Typography variant='body2' className='font-medium'>
                        Promotional offers
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Special deals and discounts
                      </Typography>
                    </div>
                  }
                />
                <FormControlLabel
                  control={<Switch defaultChecked size='small' />}
                  label={
                    <div>
                      <Typography variant='body2' className='font-medium'>
                        App updates
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        New features and improvements
                      </Typography>
                    </div>
                  }
                />
              </div>
            </div>
          </Grid>
        </Grid>
      </CardContent>
      <Divider />
      <CardActions className='gap-4'>
        <Button variant='contained' startIcon={<i className='ri-save-line' />}>
          Save Preferences
        </Button>
        <Button variant='outlined' color='secondary' startIcon={<i className='ri-refresh-line' />}>
          Reset to Default
        </Button>
      </CardActions>
    </Card>
  )
}

export default CustomerNotifications