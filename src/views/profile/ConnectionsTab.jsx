'use client'

// MUI Imports
import { Grid, Card, CardContent, Typography, Button } from '@mui/material'

const ConnectionsTab = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardContent className='flex flex-col items-center justify-center gap-4 text-center py-16'>
            <i className='ri-link-m text-6xl text-textSecondary' />
            <div>
              <Typography variant='h5' className='mb-2'>
                Connections Feature Coming Soon
              </Typography>
              <Typography variant='body2' color='text.secondary' className='mb-4'>
                Manage your professional connections and network here.
              </Typography>
            </div>
            <Button variant='outlined' disabled>
              Available Soon
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ConnectionsTab