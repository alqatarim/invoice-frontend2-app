'use client';

import Link from 'next/link';
import { Box, Typography, Avatar, Chip } from '@mui/material';
import { Icon } from '@iconify/react';
import moment from 'moment';
import { getPaymentStatusOption, paymentMethods } from '@/data/dataSets';
import OptionMenu from '@core/components/option-menu';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

export const getPaymentColumns = ({
  theme = {},
  permissions = {},
  onDelete,
  onView,
  onEdit,
  onSetAsSuccess,
  onSetAsFailed,
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
      key: 'customer',
      visible: true,
      label: 'Customer',
      sortable: true,
      renderCell: row => (
        <Box className="flex items-center gap-2">
          <Avatar
            src={row.customerDetail?.image}
            alt={row.customerDetail?.name}
            sx={{ width: 34, height: 34 }}
          >
            {!row.customerDetail?.image && <Icon icon="mdi:image-off-outline" />}
          </Avatar>
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
            <Typography variant="caption" display="block" className="text-[0.8rem]">
              {row.customerDetail?.phone || '—'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      visible: true,
      align: 'center',
      sortable: true,
      renderCell: row => {
        const total = Number(row.amount) || 0;

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
      },
    },
    {
      key: 'payment_date',
      visible: true,
      label: 'Date',
      align: 'center',
      sortable: true,
      renderCell: row => (
        <Typography variant="body1" color="text.primary" className="text-[0.9rem] whitespace-nowrap">
          {row.createdAt ? moment(row.createdAt).format('DD MMM YY') : 'N/A'}
        </Typography>
      ),
    },
    {
      key: 'payment_method',
      label: 'Payment Method',
      visible: true,
      sortable: true,
      renderCell: row => (
        <Box className="flex items-center gap-1.5">
          <Icon
            icon={paymentMethods.find(item => item.value === row.payment_method)?.icon || 'mdi:credit-card-outline'}
            fontSize={18}
            color={theme.palette?.text?.secondary}
          />
          <Typography color="text.primary">{row.payment_method || '-'}</Typography>
        </Box>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      visible: true,
      align: 'center',
      sortable: true,
      renderCell: row => {
        const statusOption = getPaymentStatusOption(row.status);

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
        const options = [];

        if (permissions.canView) {
          options.push({
            text: 'View',
            icon: <Icon icon="mdi:eye-outline" />,
            menuItemProps: {
              className: 'flex items-center gap-2 text-textSecondary',
              onClick: () => onView?.(row._id),
            },
          });
        }

        if (permissions.canUpdate) {
          options.push({
            text: 'Edit',
            icon: <Icon icon="mdi:edit-outline" />,
            menuItemProps: {
              className: 'flex items-center gap-2 text-textSecondary',
              onClick: () => onEdit?.(row._id),
            },
          });
        }

        const normalizedStatus = String(row.status || '').trim();

        if (permissions.canUpdate && normalizedStatus === 'Pending') {
          options.push({
            text: 'Set as Success',
            icon: <Icon icon="mdi:check-circle-outline" />,
            menuItemProps: {
              className: 'flex items-center gap-2 text-textSecondary',
              onClick: () => onSetAsSuccess?.(row._id),
            },
          });
          options.push({
            text: 'Set as Failed',
            icon: <Icon icon="mdi:close-circle-outline" />,
            menuItemProps: {
              className: 'flex items-center gap-2 text-textSecondary',
              onClick: () => onSetAsFailed?.(row._id),
            },
          });
        }

        if (permissions.canDelete && row.status !== 'Cancelled') {
          options.push({
            text: 'Delete',
            icon: <Icon icon="mdi:delete-outline" />,
            menuItemProps: {
              className: 'flex items-center gap-2 text-textSecondary',
              onClick: () => onDelete?.(row),
            },
          });
        }

        return options.length ? (
          <OptionMenu
            icon={<MoreVertIcon />}
            iconButtonProps={{ size: 'small', 'aria-label': 'payment actions' }}
            options={options}
          />
        ) : null;
      },
    },
  ];
