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
          const companyAdmins = users.filter(user =>
               ['OWNER', 'COMPANY_ADMIN'].includes(user.companyRole || user.orgRole)
          ).length;
          const storeScopedUsers = users.filter(
               user => Array.isArray(user.assignedBranchIds) && user.assignedBranchIds.length > 0
          ).length;

          return {
               totalUsers: { count: totalUsers, amount: totalUsers },
               companyAdmins: { count: companyAdmins, amount: companyAdmins },
               storeScopedUsers: { count: storeScopedUsers, amount: storeScopedUsers },
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
                              Team
                         </Typography>
                    </div>
               </div>

               {/* Statistics Cards */}
               <div className="mb-2">
                    <Grid container spacing={4}>
                         <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <HorizontalWithBorder
                                   title="Total Members"
                                   subtitle="Company And Store Team"
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
                                   title="Company Admins"
                                   subtitle="Owner And Company Admin"
                                   titleVariant='h5'
                                   subtitleVariant='body2'
                                   stats={statsData.companyAdmins.count}
                                   statsVariant='h4'
                                   trendNumber={statsData.companyAdmins.count}
                                   trendNumberVariant='body1'
                                   avatarIcon='mdi:shield-account-outline'
                                   color="info"
                                   iconSize='30px'
                              />
                         </Grid>

                         <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <HorizontalWithBorder
                                   title="Store Members"
                                   subtitle="Assigned To One Or More Stores"
                                   titleVariant='h5'
                                   subtitleVariant='body2'
                                   stats={statsData.storeScopedUsers.count}
                                   statsVariant='h4'
                                   trendNumber={statsData.storeScopedUsers.count}
                                   trendNumberVariant='body1'
                                   avatarIcon='mdi:store-cog-outline'
                                   color="success"
                                   iconSize='30px'
                              />
                         </Grid>
                    </Grid>
               </div>
          </>
     );
};

export default UsersHead;
