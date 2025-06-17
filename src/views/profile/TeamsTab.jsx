'use client'

// MUI Imports
import { Card, Grid, CardContent, Typography, Button } from '@mui/material'

const TeamsTab = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardContent className='flex flex-col items-center justify-center gap-4 text-center py-16'>
            <i className='ri-team-line text-6xl text-textSecondary' />
            <div>
              <Typography variant='h5' className='mb-2'>
                Teams Feature Coming Soon
              </Typography>
              <Typography variant='body2' color='text.secondary' className='mb-4'>
                Manage your team memberships and collaborations here.
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

export default TeamsTab