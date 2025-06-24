// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

const CustomerPlan = () => {
  return (
    <Card>
      <CardContent className='flex flex-col gap-6'>
        <div className='flex flex-col gap-4'>
          <Typography variant='h5'>Current Plan</Typography>
          <Divider />
          <div className='flex items-center gap-4'>
            <CustomAvatar variant='rounded' skin='light' color='primary'>
              <i className='ri-crown-line' />
            </CustomAvatar>
            <div className='flex flex-col gap-1'>
              <Typography variant='h6'>Standard Plan</Typography>
              <Typography variant='body2' color='text.secondary'>
                Active subscription
              </Typography>
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between'>
              <Typography color='text.primary'>Plan Status:</Typography>
              <Chip label='Active' variant='tonal' color='success' size='small' />
            </div>
            <div className='flex items-center justify-between'>
              <Typography color='text.primary'>Billing Cycle:</Typography>
              <Typography>Monthly</Typography>
            </div>
            <div className='flex items-center justify-between'>
              <Typography color='text.primary'>Next Billing:</Typography>
              <Typography>Jan 15, 2024</Typography>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CustomerPlan