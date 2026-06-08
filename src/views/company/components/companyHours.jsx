'use client'

import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import SectionHeader from '@components/headers/SectionHeader'

const CompanyHours = ({
  storeHours,
  storeHourDays,
  handleStoreHourChange,
  handleStoreDayOpenToggle,
}) => {
  const theme = useTheme()

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ height: '100%', boxSizing: 'border-box', overflow: 'auto' }}>
        <SectionHeader title='Store Hours' icon='ri-time-line' color='info' className='mb-5' />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            maxWidth: 700,
            height: '100%',
          }}
        >
          {storeHourDays.map(day => {
            const dayHours = storeHours?.[day.key] || {
              open: '00:00',
              close: '00:00',
              isClosed: false,
            }
            const isOpen = !dayHours.isClosed

            return (
              <Box
                key={day.key}
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: 2,
                  p: 2,
                  borderRadius: 1,
                  borderColor: theme.palette.secondary.lightestOpacity,
                  borderWidth: 1,
                  backgroundColor: theme.palette.secondary.lightestOpacity,
                }}
              >
                <Box sx={{ width: { xs: '100%', sm: 120 }, flexShrink: 0 }}>
                  <Typography variant='body1'>{day.label}</Typography>
                </Box>

                {isOpen && (
                  <Box sx={{ display: 'flex', gap: 2, flex: 1, width: { xs: '100%', sm: 'auto' } }}>
                    <TextField
                      size='small'
                      fullWidth
                      type='time'
                      value={dayHours.open}
                      onChange={event => handleStoreHourChange(day.key, 'open', event.target.value)}
                      inputProps={{ step: 300, style: { padding: '8.5px 14px' } }}
                    />
                    <Typography sx={{ alignSelf: 'center', color: 'text.disabled' }}>-</Typography>
                    <TextField
                      size='small'
                      fullWidth
                      type='time'
                      value={dayHours.close}
                      onChange={event => handleStoreHourChange(day.key, 'close', event.target.value)}
                      inputProps={{ step: 300, style: { padding: '8.5px 14px' } }}
                    />
                  </Box>
                )}

                <FormControlLabel
                  sx={{ m: 0, mr: { xs: 0, sm: 2 }, alignSelf: { xs: 'flex-start', sm: 'center' } }}
                  control={
                    <Switch
                      size='small'
                      checked={isOpen}
                      onChange={(_event, checked) => handleStoreDayOpenToggle(day.key, checked)}
                    />
                  }
                  label={isOpen ? 'Open' : 'Closed'}
                />
              </Box>
            )
          })}
        </Box>
      </CardContent>
    </Card>
  )
}

export default CompanyHours
