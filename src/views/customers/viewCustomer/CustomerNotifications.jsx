// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'

const CustomerNotifications = ({ customerData }) => {
  return (
    <Card>
      <CardHeader title='Notification Preferences' />
      <CardContent>
        <div className='flex flex-col gap-6'>
          {/* Email Notifications */}
          <div className='flex flex-col gap-4'>
            <Typography variant='h6'>Email Notifications</Typography>
            <div className='flex flex-col gap-2'>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label='New order confirmations'
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label='Order status updates'
              />
              <FormControlLabel
                control={<Switch />}
                label='Payment reminders'
              />
              <FormControlLabel
                control={<Switch />}
                label='Marketing emails'
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label='Account security alerts'
              />
            </div>
          </div>

          <Divider />

          {/* SMS Notifications */}
          <div className='flex flex-col gap-4'>
            <Typography variant='h6'>SMS Notifications</Typography>
            <div className='flex flex-col gap-2'>
              <FormControlLabel
                control={<Switch />}
                label='Order confirmations'
              />
              <FormControlLabel
                control={<Switch />}
                label='Delivery updates'
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label='Security alerts'
              />
            </div>
          </div>

          <Divider />

          {/* Push Notifications */}
          <div className='flex flex-col gap-4'>
            <Typography variant='h6'>Push Notifications</Typography>
            <div className='flex flex-col gap-2'>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label='Order updates'
              />
              <FormControlLabel
                control={<Switch />}
                label='Promotional offers'
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label='App updates'
              />
            </div>
          </div>

          <Button variant='contained' className='self-start'>
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default CustomerNotifications