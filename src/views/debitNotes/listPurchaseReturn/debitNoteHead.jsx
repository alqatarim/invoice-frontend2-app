'use client';

import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import PageIconHeader from '@components/headers/PageIconHeader';
import HorizontalWithoutBorder from '@components/card-statistics/HorizontalWithoutBorder';

/**
 * DebitNoteHead Component - Displays debit note statistics header
 */
const DebitNoteHead = ({ debitNoteListData }) => {
     const debitNoteStats = useMemo(() => {
          const stats = (debitNoteListData || []).reduce(
               (accumulator, debitNote) => {
                    accumulator.totalDebitNotes += 1;
                    accumulator.totalAmount += Number(debitNote.TotalAmount) || 0;
                    accumulator.activeDebitNotes += 1;

                    return accumulator;
               },
               {
                    totalDebitNotes: 0,
                    totalAmount: 0,
                    activeDebitNotes: 0,
               }
          );

          return {
               ...stats,
               avgDebitNoteValue: stats.totalDebitNotes > 0 ? stats.totalAmount / stats.totalDebitNotes : 0,
          };
     }, [debitNoteListData]);

     const statCards = useMemo(
          () => [
               {
                    title: 'Total Debit Notes',
                    value: debitNoteStats.totalDebitNotes,
                    subtitle: `${debitNoteStats.activeDebitNotes} active`,
                    icon: 'tabler:receipt',
                    color: 'primary',
               },
               {
                    title: 'Active Debit Notes',
                    value: debitNoteStats.activeDebitNotes,
                    subtitle: `${Math.round((debitNoteStats.activeDebitNotes / Math.max(debitNoteStats.totalDebitNotes, 1)) * 100)}%`,
                    icon: 'mdi:check-circle-outline',
                    color: 'success',
               },
               {
                    title: 'Total Amount',
                    value: debitNoteStats.totalAmount,
                    subtitle: 'Total Value',
                    icon: 'hugeicons:saudi-riyal',
                    color: 'info',
                    isCurrency: true,
               },
               {
                    title: 'Average Value',
                    value: debitNoteStats.avgDebitNoteValue,
                    subtitle: 'Avg Debit Note',
                    icon: 'mdi:chart-line',
                    color: 'warning',
                    isCurrency: true,
               },
          ],
          [debitNoteStats]
     );

     return (
          <>
               <PageIconHeader title='Debit Notes' icon='tabler:receipt' />

               <div className="mb-2">
                    <Grid container className='flex flex-wrap justify-between gap-0'>
                         {statCards.map((card) => (
                              <Grid key={card.title}>
                                   <HorizontalWithoutBorder {...card} />
                              </Grid>
                         ))}
                    </Grid>
               </div>
          </>
     );
};

export default DebitNoteHead;
