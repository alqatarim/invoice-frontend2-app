'use client'

import React, { useState, useEffect, useRef } from "react";
import { Table, TableHead, TableRow, TableCell, TableBody, TableSortLabel, TablePagination, Typography, IconButton, Card } from "@mui/material";
import { Link } from "next/link";
import { usePermission } from '@/Auth/usePermission';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import moment from "moment"; // Import moment for date formatting

const Listproduct = ({ productListData, page, setPage, size, setSize, sortBy, setSortBy, sortDirection, setSortDirection }) => {
  const canUpdate = usePermission('product', 'update');
  const canDelete = usePermission('product', 'delete');




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
  );
};

export default Listproduct;
