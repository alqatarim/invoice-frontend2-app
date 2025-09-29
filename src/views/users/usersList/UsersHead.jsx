'use client';

import React, { useMemo } from 'react';
import { Grid, Avatar, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder';

/**
 * UsersHead Component - Displays users statistics header
 */
const UsersHead = ({ users = [] }) => {
     const theme = useTheme();

     // Calculate statistics based on actual users data
     const statsData = useMemo(() => {
          const totalUsers = users.length;
          const activeUsers = users.filter(user => user.status === 'Active').length;
          const inactiveUsers = users.filter(user => user.status === 'Inactive').length;

          return {
               totalUsers: { count: totalUsers, amount: totalUsers },
               activeUsers: { count: activeUsers, amount: activeUsers },
               inactiveUsers: { count: inactiveUsers, amount: inactiveUsers },
          };
     }, [users]);

     return (
          <>
               {/* Header Section */}
               <div className="flex justify-start items-center mb-5">
                    <div className="flex items-center gap-2">
                         <Avatar className='bg-primary/12 text-primary bg-primaryLight w-12 h-12'>
                              <Icon icon="mdi:account-group" fontSize={26} />
                         </Avatar>
                         <Typography variant="h5" className="font-semibold text-primary">
                              Users
                         </Typography>
                    </div>
               </div>

               {/* Statistics Cards */}
               <div className="mb-2">
                    <Grid container spacing={4}>
                         <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <HorizontalWithBorder
                                   title="Total Users"
                                   subtitle="All Users"
                                   titleVariant='h5'
                                   subtitleVariant='body2'
                                   stats={statsData.totalUsers.count}
                                   statsVariant='h4'
                                   trendNumber={statsData.totalUsers.count}
                                   trendNumberVariant='body1'
                                   avatarIcon='mdi:account-group'
                                   color="primary"
                                   iconSize='30px'
                              />
                         </Grid>

                         <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <HorizontalWithBorder
                                   title="Active Users"
                                   subtitle="Currently Active"
                                   titleVariant='h5'
                                   subtitleVariant='body2'
                                   stats={statsData.activeUsers.count}
                                   statsVariant='h4'
                                   trendNumber={statsData.activeUsers.count}
                                   trendNumberVariant='body1'
                                   avatarIcon='mdi:account-check-outline'
                                   color="success"
                                   iconSize='30px'
                              />
                         </Grid>

                         <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <HorizontalWithBorder
                                   title="Inactive Users"
                                   subtitle="Currently Inactive"
                                   titleVariant='h5'
                                   subtitleVariant='body2'
                                   stats={statsData.inactiveUsers.count}
                                   statsVariant='h4'
                                   trendNumber={statsData.inactiveUsers.count}
                                   trendNumberVariant='body1'
                                   avatarIcon='mdi:account-off-outline'
                                   color="warning"
                                   iconSize='30px'
                              />
                         </Grid>
                    </Grid>
               </div>
          </>
     );
};

export default UsersHead;
