'use client';

import React, { useState, useEffect } from 'react';
import { Grid, Avatar, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { amountFormat } from '@/utils/numberUtils';
import { getInitialInvoiceData } from '@/app/(dashboard)/invoices/actions';
import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder';

/**
 * InvoiceHead Component - Displays invoice statistics header
 */
const InvoiceHead = ({ invoiceListData }) => {
  const theme = useTheme();
  const [cardCounts, setCardCounts] = useState({
    totalCancelled: {},
    totalOutstanding: {},
    totalOverdue: {},
    totalInvoice: {},
    totalDrafted: {},
    recurringTotal: {}
  });

  useEffect(() => {
    const fetchCardCounts = async () => {
      try {
        const response = await getInitialInvoiceData();
        if (response.cardCounts) {
          setCardCounts({
            totalCancelled: response.cardCounts.total_cancelled?.[0] || {},
            totalOutstanding: response.cardCounts.total_outstanding?.[0] || {},
            totalOverdue: response.cardCounts.total_overdue?.[0] || {},
            totalInvoice: response.cardCounts.total_invoice?.[0] || {},
            totalDrafted: response.cardCounts.total_drafted?.[0] || {},
            recurringTotal: response.cardCounts.recurring_total?.[0] || {}
          });
        }
      } catch (error) {
        console.error('Error fetching invoice card counts:', error);
      }
    };

    fetchCardCounts();
  }, [invoiceListData]);

  const currencySymbol = invoiceListData.currencySymbol || '$';

  return (
    <>
      {/* Header Section */}
      <div className="flex justify-start items-center mb-5">
        <div className="flex items-center gap-2">
          <Avatar className='bg-primary/12 text-primary bg-primaryLight  w-12 h-12'>
            <Icon icon="tabler:file-invoice" fontSize={26} />
          </Avatar>
          <Typography variant="h5" className="font-semibold text-primary">
            Invoices
          </Typography>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-2">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <HorizontalWithBorder
              title="Total Invoiced"
              subtitle="No of Invoices"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={`${currencySymbol} ${amountFormat(cardCounts.totalInvoice?.total_sum)}`}
              statsVariant='h4'
              trendNumber={cardCounts.totalInvoice?.count || 0}
              trendNumberVariant='body1'
              avatarIcon='iconamoon:invoice'
              color="primary"
              iconSize='30px'
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <HorizontalWithBorder
              title="Outstanding"
              subtitle="No of Outstandings"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={`${currencySymbol} ${amountFormat(cardCounts.totalOutstanding?.total_sum)}`}
              statsVariant='h4'
              trendNumber={cardCounts.totalOutstanding?.count || 0}
              trendNumberVariant='body1'
              avatarIcon='mdi:access-time'
              color="warning"
              iconSize='35px'
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <HorizontalWithBorder
              title="Total Overdue"
              subtitle="No of Overdue"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={`${currencySymbol} ${amountFormat(cardCounts.totalOverdue?.total_sum)}`}
              statsVariant='h4'
              trendNumber={cardCounts.totalOverdue?.count || 0}
              trendNumberVariant='body1'
              avatarIcon='mdi:clock-alert-outline'
              color="error"
              iconSize='35px'
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <HorizontalWithBorder
              title="Drafts"
              subtitle="No of Drafts"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={`${currencySymbol} ${amountFormat(cardCounts.totalDrafted?.total_sum)}`}
              statsVariant='h4'
              trendNumber={cardCounts.totalDrafted?.count || 0}
              trendNumberVariant='body1'
              avatarIcon='mdi:draw-pen'
              color="info"
              iconSize='35px'
            />
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default InvoiceHead;