'use client';

import Link from 'next/link';
import { Box, Typography, Avatar, Chip } from '@mui/material';
import { Icon } from '@iconify/react';
import moment from 'moment';
import { paymentMethods, paymentSummaryStatus } from '@/data/dataSets';
import OptionMenu from '@core/components/option-menu';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

const getPaymentSummaryStatusOption = status => {
  const normalized = String(status || '').trim();
  const matched = paymentSummaryStatus.find(option => option.value === normalized);

  if (matched) {
    return matched;
  }

  return {
    value: normalized || 'N/A',
    label: normalized
      ? normalized.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase())
      : 'N/A',
    color: 'default',
  };
};

const renderCurrencyCell = (value, theme) => {
  const total = Number(value) || 0;

  return (
    <div className="flex items-end justify-start gap-0">
      <Icon icon="lucide:saudi-riyal" width="0.75rem" color={theme.palette?.text?.primary} />
      <Typography color="text.primary" lineHeight={1} className="font-medium">
        {total.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Typography>
    </div>
  );
};

export const getPaymentSummaryColumns = ({
  theme = {},
  permissions = {},
  onView,
  onExport,
  onPrint,
} = {}) => [
    {
      key: 'payment_number',
      visible: true,
      label: 'Payment No',
      sortable: true,
      renderCell: row => (
        <Typography
          className="cursor-pointer text-primary hover:underline font-medium"
          onClick={() => onView?.(row._id)}
        >
          {row.payment_number || 'N/A'}
        </Typography>
      ),
    },
    {
      key: 'invoiceNumber',
      visible: true,
      label: 'Invoice No',
      sortable: true,
      renderCell: row =>
        row.invoiceId ? (
          <Typography
            color="primary.main"
            variant="body1"
            className="text-[0.9rem] font-medium"
            component={Link}
            href={`/invoices/invoice-view/${row.invoiceId}`}
            sx={{ textDecoration: 'none' }}
          >
            {row.invoiceNumber?.trim() || 'N/A'}
          </Typography>
        ) : (
          <Typography variant="body1" color="text.primary" className="text-[0.9rem]">
            {row.invoiceNumber?.trim() || 'N/A'}
          </Typography>
        ),
    },
    {
      key: 'customer',
      visible: true,
      label: 'Customer',
      sortable: true,
      renderCell: row => (

        <Box>
          <Typography
            color="primary.main"
            variant="body1"
            className="text-[0.9rem] font-medium"
            component={row.customerDetail?._id ? Link : 'span'}
            href={row.customerDetail?._id ? `/customers/customer-view/${row.customerDetail._id}` : undefined}
            sx={{ textDecoration: 'none' }}
          >
            {row.customerDetail?.name || 'Deleted Customer'}
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500} className="tabular-nums">
            {row.customerDetail?.phone || row.customerDetail?.email || '—'}
          </Typography>
        </Box>

      ),
    },
    // {
    //   key: 'paymentDate',
    //   visible: true,
    //   label: 'Date',
    //   align: 'center',
    //   sortable: true,
    //   renderCell: row => (
    //     <Typography variant="body1" color="text.primary" className="text-[0.9rem] whitespace-nowrap">
    //       {row.createdAt ? moment(row.createdAt).format('DD MMM YY') : 'N/A'}
    //     </Typography>
    //   ),
    // },
    {
      key: 'paymentMethod',
      visible: true,
      label: 'Method',
      sortable: true,
      renderCell: row => (
        <Box className="flex items-center gap-1.5">
          <Icon
            icon={paymentMethods.find(item => item.value === row.payment_method)?.icon || 'mdi:credit-card-outline'}
            fontSize={18}
            color={theme.palette?.text?.secondary}
          />
          <Typography color="text.primary" className="text-[0.9rem]">
            {row.payment_method || '-'}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'invoiceAmount',
      label: 'Invoice Amount',
      visible: true,
      align: 'center',
      sortable: true,
      renderCell: row => renderCurrencyCell(row.invoiceAmount, theme),
    },
    {
      key: 'paidAmount',
      label: 'Paid Amount',
      visible: true,
      align: 'center',
      sortable: true,
      renderCell: row => renderCurrencyCell(row.amount, theme),
    },
    {
      key: 'status',
      label: 'Status',
      visible: true,
      align: 'center',
      sortable: true,
      renderCell: row => {
        const statusOption = getPaymentSummaryStatusOption(row.status);

        return (
          <Chip size="small" variant="tonal" label={statusOption.label} color={statusOption.color} />
        );
      },
    },
    {
      key: 'action',
      label: '',
      visible: true,
      align: 'right',
      renderCell: row => {
        const menuOptions = [];

        if (permissions?.canView) {
          menuOptions.push({
            text: 'View',
            icon: <Icon icon="mdi:eye-outline" />,
            menuItemProps: {
              className: 'flex items-center gap-2 text-textSecondary',
              onClick: () => onView?.(row._id),
            },
          });
        }

        if (permissions?.canExport) {
          menuOptions.push({
            text: 'Export Details',
            icon: <Icon icon="mdi:download-outline" />,
            menuItemProps: {
              className: 'flex items-center gap-2 text-textSecondary',
              onClick: () => onExport?.(row),
            },
          });
        }

        menuOptions.push({
          text: 'Print',
          icon: <Icon icon="mdi:printer-outline" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => onPrint?.(row),
          },
        });

        return menuOptions.length ? (
          <OptionMenu
            icon={<MoreVertIcon />}
            iconButtonProps={{ size: 'small', 'aria-label': 'payment summary actions' }}
            options={menuOptions}
          />
        ) : null;
      },
    },
  ];

export default getPaymentSummaryColumns;
