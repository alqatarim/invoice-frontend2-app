'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme, alpha } from '@mui/material/styles';
import {
     Avatar,
     Box,
     Button,
     Card,
     Chip,
     Typography,
     useMediaQuery,
     Grid
} from '@mui/material';
import { Icon } from '@iconify/react';
import { formatDate } from '@/utils/dateUtils';
import { paymentSummaryStatus, paymentMethodIcons } from '@/data/dataSets';
import OptionMenu from '@core/components/option-menu';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

// Helper function to get status color
const getStatusColor = (status) => {
     const statusOption = paymentSummaryStatus.find(opt => opt.value === status);
     return statusOption?.color || 'default';
};

// Format number helper function
const formatNumber = (value) => {
     if (value === null || value === undefined) return '0.00';
     const num = typeof value === 'string' ? parseFloat(value) : value;
     return isNaN(num) ? '0.00' : Number(num).toFixed(2);
};

export const getPaymentSummaryColumns = ({ theme, permissions, onView, onExport, onPrint }) => [
     {
          key: 'payment_number',
          visible: true,
          label: 'Payment No',
          sortable: true,
          align: 'center',
          renderCell: (row) => (
               <Link href={`/payment-summary/payment-summary-view/${row._id}`} passHref>
                    <Typography
                         className="cursor-pointer text-primary hover:underline"
                         align='center'
                    >
                         {row.payment_number || 'N/A'}
                    </Typography>
               </Link>
          ),
     },
     {
          key: 'invoiceNumber',
          visible: true,
          label: 'Invoice No',
          sortable: true,
          align: 'center',
          renderCell: (row) => (
               <Link href={`/invoices/invoice-view/${row.invoiceId}`} passHref>
                    <Typography
                         className="cursor-pointer text-primary hover:underline"
                         align='center'
                    >
                         {row.invoiceNumber?.trim() || 'N/A'}
                    </Typography>
               </Link>
          ),
     },
     {
          key: 'customer',
          visible: true,
          label: 'Customer',
          sortable: true,
          align: 'center',
          renderCell: (row) => (
               <Box className="flex justify-between items-start flex-col gap-1">
                    <Link href={`/customers/customer-view/${row.customerDetail?._id}`} passHref>
                         <Typography
                              variant="body1"
                              className='text-[0.95rem] text-start cursor-pointer text-primary hover:underline'
                         >
                              {row.customerDetail?.name || 'Customer'}
                         </Typography>
                    </Link>
                    <Typography
                         variant="caption"
                         color="text.secondary"
                         className='text-[0.85rem] truncate select-text'
                         sx={{ userSelect: 'text', cursor: 'text' }}
                    >
                         {row.customerDetail?.phone || row.customerDetail?.email || 'N/A'}
                    </Typography>
               </Box>
          ),
     },
     {
          key: 'paymentDate',
          visible: true,
          label: 'Payment Date',
          sortable: true,
          align: 'center',
          renderCell: (row) => (
               <Typography variant="body1" color='text.primary' className='text-[0.9rem] whitespace-nowrap'>
                    {row.createdAt ? formatDate(row.createdAt) : 'N/A'}
               </Typography>
          ),
     },
     {
          key: 'paymentMethod',
          visible: true,
          label: 'Payment Method',
          sortable: true,
          align: 'center',
          renderCell: (row) => (

               <Box className="flex items-center gap-2 justify-center">
                    <Icon icon={paymentMethodIcons.find(icon => icon.value === row.payment_method)?.label} fontSize={23} color={theme.palette.secondary.main} />
                    <Typography variant="body1" color='text.primary' className='text-[0.9rem]'>{row.payment_method || 'N/A'}</Typography>

               </Box>


          ),
     },
     {
          key: 'invoiceAmount',
          label: 'Invoice Amount',
          visible: true,
          align: 'center',
          sortable: true,
          renderCell: (row) => (
               <div className="flex items-center gap-1 justify-center">
                    <Icon icon="lucide:saudi-riyal" width="1rem" color={theme.palette.secondary.light} />
                    <Typography color="text.primary" className='text-[1rem] font-medium'>
                         {formatNumber(row.invoiceAmount)}
                    </Typography>
               </div>
          ),
     },
     {
          key: 'paidAmount',
          label: 'Paid Amount',
          visible: true,
          align: 'center',
          sortable: true,
          renderCell: (row) => (
               <div className="flex items-center gap-1 justify-center">
                    <Icon icon="lucide:saudi-riyal" width="1rem" color={theme.palette.success.main} />
                    <Typography color="success.main" className='text-[1rem] font-medium'>
                         {formatNumber(row.amount || 0)}
                    </Typography>
               </div>
          ),
     },
     {
          key: 'status',
          label: 'Status',
          visible: true,
          align: 'center',
          sortable: true,
          renderCell: (row) => (
               <Chip
                    label={row.status ? row.status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}
                    size="medium"
                    color={getStatusColor(row.status)}
                    variant="tonal"
                    sx={{ fontWeight: 500 }}
               />
          ),
     },
     {
          key: 'actions',
          label: '',
          visible: true,
          align: 'right',
          renderCell: (row) => {
               const menuOptions = [];

               if (permissions?.canView) {
                    menuOptions.push({
                         text: 'View',
                         icon: <Icon icon="tabler:eye" />,
                         menuItemProps: {
                              className: 'flex items-center gap-2 text-textSecondary',
                              onClick: () => onView?.(row)
                         }
                    });
               }

               if (permissions?.canExport) {
                    menuOptions.push({
                         text: 'Export Details',
                         icon: <Icon icon="tabler:download" />,
                         menuItemProps: {
                              className: 'flex items-center gap-2 text-textSecondary',
                              onClick: () => onExport?.(row)
                         }
                    });
               }

               menuOptions.push({
                    text: 'Print',
                    icon: <Icon icon="tabler:printer" />,
                    menuItemProps: {
                         className: 'flex items-center gap-2 text-textSecondary',
                         onClick: () => onPrint?.(row)
                    }
               });

               if (menuOptions.length === 0) return null;

               return (
                    <Box className="flex items-center justify-end">
                         <OptionMenu
                              icon={<MoreVertIcon />}
                              iconButtonProps={{ size: 'small', 'aria-label': 'payment summary actions' }}
                              options={menuOptions}
                         />
                    </Box>
               );
          },
     }
];

export default getPaymentSummaryColumns;
