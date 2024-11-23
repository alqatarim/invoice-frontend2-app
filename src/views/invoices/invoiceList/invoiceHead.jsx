// app/invoices/components/InvoiceHead.jsx

'use client';




import React, { useState, useEffect } from 'react';
import { Box, Grid } from '@mui/material';
import { amountFormat } from '@/common/helper';
import { getInitialInvoiceData } from '@/app/(dashboard)/invoices/actions';
import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder'
/**
 * InvoiceHead Component
 * Displays key invoice statistics.
 *
 * @param {Object} props - Component props
 * @param {Object} props.invoiceListData - Data containing invoice statistics
 * @returns JSX.Element
 */







const InvoiceHead = ({ invoiceListData }) => {



const [totalCancelled, settotalCancelled] = useState({});
const [totaloutstanding, settotaloutstanding] = useState({});
const [totalOverdue, settotalOverdue] = useState({});
const [total_invoice, settotal_invoice] = useState({});
const [total_drafted, settotal_drafted] = useState({});

const [recurring_total, setrecurring_total] = useState({});

// const { create, delete: remove } = permission;

const getInvoiceListCardsCounts = async () => {
  console.log('Fetching invoice data...');
  try {
    const response = await getInitialInvoiceData();
    if (response.cardCounts) {
      settotalCancelled(response.cardCounts.total_cancelled?.[0] || {});
      settotaloutstanding(response.cardCounts.total_outstanding?.[0] || {});
      settotalOverdue(response.cardCounts.total_overdue?.[0] || {});
      settotal_invoice(response.cardCounts.total_invoice?.[0] || {});
      settotal_drafted(response.cardCounts.total_drafted?.[0] || {});
      setrecurring_total(response.cardCounts.recurring_total?.[0] || {});
    }
    return response;
  } catch (error) {
    console.error('Error fetching invoice list cards counts:', error);
  }
};


useEffect(() => {
  getInvoiceListCardsCounts();
}, [invoiceListData]);

// const totalSum = (totaloutstanding, totalOverdue, total_drafted) => {
//   const totalValue = totaloutstanding + totalOverdue + total_drafted;

//   return totalValue;
// };

    return (
        <Box sx={{ mb: 2 }}>
            <Grid container spacing={4}>

               {/* Total Invoiced Card */}
               <Grid item xs={12} sm={6} md={3}>
               < HorizontalWithBorder
               title="Total Invoiced"
               subtitle="No of Invoices"
               titleVariant='h5'
               subtitleVariant='body2'
               stats={`${invoiceListData.currencySymbol || '$'} ${amountFormat(total_invoice?.total_sum)}`}
               statsVariant='h4'
               trendNumber={total_invoice?.count || 0}
               trendNumberVariant='body1'
               avatarIcon= 'icon-[mdi--invoice-text-outline]'
               color="primary"
               iconSize='35px'

               />
                </Grid>

{/* Outstanding Card */}
<Grid item xs={12} sm={6} md={3}>
               < HorizontalWithBorder
               title="Outstanding"
               subtitle="No of Outstandings"
               titleVariant='h5'
               subtitleVariant='body2'
               stats={`${invoiceListData.currencySymbol || '$'} ${amountFormat(totaloutstanding?.total_sum)}`}
               statsVariant='h4'
               trendNumber={totaloutstanding?.count || 0}
               trendNumberVariant='body1'
               avatarIcon= 'icon-[mdi--invoice-text-clock-outline]'
               color="warning"
               iconSize='35px'

               />
                </Grid>


 {/* Total Overdue Card */}
            <Grid item xs={12} sm={6} md={3}>
               < HorizontalWithBorder
               title="Total Overdue"
               subtitle="No of Overdue"
               titleVariant='h5'
               subtitleVariant='body2'
               stats={`${invoiceListData.currencySymbol || '$'} ${amountFormat(totalOverdue?.total_sum)}`}
               statsVariant='h4'
               trendNumber={totalOverdue?.count || 0}
               trendNumberVariant='body1'
               avatarIcon= 'icon-[mdi--invoice-text-remove-outline]'
               color="error"
               iconSize='35px'

               />
                </Grid>

            {/* Drafts Card */}
            <Grid item xs={12} sm={6} md={3}>
               < HorizontalWithBorder
               title="Drafts"
               subtitle="No of Drafts"
               titleVariant='h5'
               subtitleVariant='body2'
               stats={`${invoiceListData.currencySymbol || '$'} ${amountFormat(total_drafted?.total_sum)}`}
               statsVariant='h4'
               trendNumber={total_drafted?.count || 0}
               trendNumberVariant='body1'
               avatarIcon= 'icon-[mdi--invoice-text-edit-outline]'
               color="info"
               iconSize='35px'

               />
                </Grid>

            </Grid>
        </Box>
    )
    };

export default InvoiceHead;
