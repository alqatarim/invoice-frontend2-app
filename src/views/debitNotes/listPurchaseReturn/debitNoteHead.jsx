'use client';

import React, { useState, useEffect } from 'react';
import { Grid, Avatar, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { amountFormat } from '@/utils/numberUtils';
import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder';

/**
 * DebitNoteHead Component - Displays debit note statistics header
 */
const DebitNoteHead = ({ debitNoteListData }) => {
     const theme = useTheme();
     const [debitNoteStats, setDebitNoteStats] = useState({
          totalDebitNotes: 0,
          totalAmount: 0,
          avgDebitNoteValue: 0,
          activeDebitNotes: 0,
     });

     useEffect(() => {
          const calculateStats = () => {
               if (debitNoteListData && debitNoteListData.length > 0) {
                    const stats = debitNoteListData.reduce((acc, debitNote) => {
                         // Count total debit notes
                         acc.totalDebitNotes++;

                         // Calculate total amount
                         const amount = Number(debitNote.TotalAmount) || 0;
                         acc.totalAmount += amount;

                         // Count active debit notes (assume all are active for now)
                         acc.activeDebitNotes++;

                         return acc;
                    }, {
                         totalDebitNotes: 0,
                         totalAmount: 0,
                         activeDebitNotes: 0,
                    });

                    // Calculate average debit note value
                    stats.avgDebitNoteValue = stats.totalDebitNotes > 0 ? stats.totalAmount / stats.totalDebitNotes : 0;

                    setDebitNoteStats(stats);
               } else {
                    // Reset stats when no data
                    setDebitNoteStats({
                         totalDebitNotes: 0,
                         totalAmount: 0,
                         avgDebitNoteValue: 0,
                         activeDebitNotes: 0,
                    });
               }
          };

          calculateStats();
     }, [debitNoteListData]);

     const currencySymbol = '﷼'; // Saudi Riyal symbol

     return (
          <>
               {/* Header Section */}
               <div className="flex justify-start items-center mb-5">
                    <div className="flex items-center gap-2">
                         <Avatar className='bg-primary/12 text-primary bg-primaryLight w-12 h-12'>
                              <Icon icon="tabler:receipt" fontSize={26} />
                         </Avatar>
                         <Typography variant="h5" className="font-semibold text-primary">
                              Debit Notes
                         </Typography>
                    </div>
               </div>

               {/* Statistics Cards */}
               <div className="mb-2">
                    <Grid container spacing={4}>
                         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                              <HorizontalWithBorder
                                   title="Total Debit Notes"
                                   subtitle="All Debit Notes"
                                   titleVariant='h5'
                                   subtitleVariant='body2'
                                   stats={debitNoteStats.totalDebitNotes.toString()}
                                   statsVariant='h4'
                                   trendNumber={`${debitNoteStats.activeDebitNotes} Active`}
                                   trendNumberVariant='body1'
                                   avatarIcon='tabler:receipt'
                                   color="primary"
                                   iconSize='30px'
                              />
                         </Grid>

                         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                              <HorizontalWithBorder
                                   title="Active Debit Notes"
                                   subtitle="Currently Active"
                                   titleVariant='h5'
                                   subtitleVariant='body2'
                                   stats={debitNoteStats.activeDebitNotes.toString()}
                                   statsVariant='h4'
                                   trendNumber={`${Math.round((debitNoteStats.activeDebitNotes / Math.max(debitNoteStats.totalDebitNotes, 1)) * 100)}%`}
                                   trendNumberVariant='body1'
                                   avatarIcon='mdi:check-circle-outline'
                                   color="success"
                                   iconSize='35px'
                              />
                         </Grid>

                         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                              <HorizontalWithBorder
                                   title="Total Amount"
                                   subtitle="Total Value"
                                   titleVariant='h5'
                                   subtitleVariant='body2'
                                   stats={`${currencySymbol} ${amountFormat(debitNoteStats.totalAmount)}`}
                                   statsVariant='h4'
                                   trendNumber="Total Value"
                                   trendNumberVariant='body1'
                                   avatarIcon='mdi:currency-usd'
                                   color="info"
                                   iconSize='35px'
                              />
                         </Grid>

                         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                              <HorizontalWithBorder
                                   title="Average Value"
                                   subtitle="Per Debit Note"
                                   titleVariant='h5'
                                   subtitleVariant='body2'
                                   stats={`${currencySymbol} ${amountFormat(debitNoteStats.avgDebitNoteValue)}`}
                                   statsVariant='h4'
                                   trendNumber="Avg Debit Note"
                                   trendNumberVariant='body1'
                                   avatarIcon='mdi:chart-line'
                                   color="warning"
                                   iconSize='35px'
                              />
                         </Grid>
                    </Grid>
               </div>
          </>
     );
};

export default DebitNoteHead;
