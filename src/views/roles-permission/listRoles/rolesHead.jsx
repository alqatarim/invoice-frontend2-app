'use client'

import { Grid, Avatar, Typography } from '@mui/material'
import { Icon } from '@iconify/react'
import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder'

const RolesHead = ({ cardCounts }) => {
  return (
    <>
      {/* Header Section */}
      <div className="flex justify-start items-center mb-5">
        <div className="flex items-center gap-2">
          <Avatar className='bg-primary/12 text-primary bg-primaryLight w-12 h-12'>
            <Icon icon="ri-group-line" fontSize={26} />
          </Avatar>
          <Typography variant="h5" className="font-semibold text-primary">
            Roles & Permissions
          </Typography>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-2">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <HorizontalWithBorder
              title="Total Roles"
              subtitle="No of Roles"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={cardCounts?.totalRoles || 0}
              statsVariant='h4'
              trendNumber={cardCounts?.totalRoles || 0}
              trendNumberVariant='body1'
              avatarIcon='ri-group-line'
              color="primary"
              iconSize='30px'
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <HorizontalWithBorder
              title="Active Roles"
              subtitle="No of Active Roles"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={cardCounts?.activeRoles || 0}
              statsVariant='h4'
              trendNumber={cardCounts?.activeRoles || 0}
              trendNumberVariant='body1'
              avatarIcon='ri-check-double-line'
              color="success"
              iconSize='30px'
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <HorizontalWithBorder
              title="Super Admin"
              subtitle="No of Super Admin"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={cardCounts?.superAdminRole || 0}
              statsVariant='h4'
              trendNumber={cardCounts?.superAdminRole || 0}
              trendNumberVariant='body1'
              avatarIcon='ri-admin-line'
              color="warning"
              iconSize='30px'
            />
          </Grid>
        </Grid>
      </div>
    </>
  )
}

export default RolesHead