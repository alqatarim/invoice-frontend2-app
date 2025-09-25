'use client';

import Link from 'next/link';
import { Box, Typography, Avatar, Chip, IconButton } from '@mui/material';
import { Icon } from '@iconify/react';
import { formatDate } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/currencyUtils';
import { useTheme } from '@mui/material/styles';
import { actionButtons } from '@/data/dataSets';

const getPaymentModeIcon = (mode) => {
  switch (mode) {
    case 'Cash':
      return 'mdi:cash-multiple';
    case 'Cheque':
      return 'mdi:checkbook';
    case 'Bank':
      return 'mdi:bank';
    case 'Online':
      return 'mdi:web';
    default:
      return 'bi:credit-card';
  }
};

export const paymentColumns = ({ handleView, handleEdit, handleDelete }) => {
  const theme = useTheme();

  const handlers = { handleView, handleEdit, handleDelete };

  return [
    {
      key: 'payment_number',
      label: 'Payment No',
      visible: true,
      sortable: true,
      renderCell: (row, handlers) => (
        <Typography
          variant="h6"
          color="primary"
          sx={{ cursor: 'pointer', textDecoration: 'none' }}
          onClick={() => handlers?.handleView?.(row._id)}
        >
          {row.payment_number}
        </Typography>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      visible: true,
      sortable: true,
      renderCell: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            src={row.customerDetail?.image}
            alt={row.customerDetail?.name}
            sx={{ mr: 2, width: 34, height: 34 }}
          >
            {!row.customerDetail?.image && <Icon icon="mdi:image-off-outline" />}
          </Avatar>
          <Box>
            <Typography
              color="primary.main"
              variant="h6"
              component={Link}
              href={`/customers/customer-view/${row.customerDetail?._id}`}
              sx={{ textDecoration: 'none' }}
            >
              {row.customerDetail?.name || 'Deleted Customer'}
            </Typography>
            <Typography variant="caption" display="block">
              {row.customerDetail?.phone || 'Deleted Customer'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      visible: true,
      sortable: true,
      renderCell: (row) => (
        <Typography variant="body1">{formatCurrency(row.amount)}</Typography>
      ),
    },
    {
      key: 'payment_date',
      label: 'Payment Date',
      visible: true,
      sortable: true,
      renderCell: (row) => (
        <Typography variant="body1">{formatDate(row.createdAt)}</Typography>
      ),
    },
    {
      key: 'payment_method',
      label: 'Payment Method',
      visible: true,
      sortable: true,
      renderCell: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon
            icon={getPaymentModeIcon(row.payment_method)}
            fontSize={23}
            color={theme.palette.secondary.main}
          />
          <Typography variant="body1">{row.payment_method}</Typography>
        </Box>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      visible: true,
      sortable: true,
      renderCell: (row) => (
        <Chip
          color={
            row.status === 'Success'
              ? 'success'
              : row.status === 'Processing'
                ? 'primary'
                : row.status === 'Pending'
                  ? 'warning'
                  : row.status === 'Failed'
                    ? 'error'
                    : 'secondary'
          }
          variant="tonal"
          size="medium"
          label={row.status.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')}
        />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      visible: true,
      sortable: false,
      renderCell: (row, cellHandlers) => {
        const menuOptions = actionButtons.filter(action => action.id !== 'view' && action.id !== 'edit');

        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => cellHandlers?.handleView?.(row._id)}
              title={actionButtons.find(action => action.id === 'view').title}
            >
              <Icon icon={actionButtons.find(action => action.id === 'view').icon} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => cellHandlers?.handleEdit?.(row._id)}
              title={actionButtons.find(action => action.id === 'edit').title}
            >
              <Icon icon={actionButtons.find(action => action.id === 'edit').icon} />
            </IconButton>
            {row.status !== 'Cancelled' && (
              <IconButton
                size="small"
                onClick={() => cellHandlers?.handleDelete?.(row._id)}
                title={actionButtons.find(action => action.id === 'delete').title}
                color={actionButtons.find(action => action.id === 'delete').color}
              >
                <Icon icon={actionButtons.find(action => action.id === 'delete').icon} />
              </IconButton>
            )}
          </Box>
        );
      },
    },
  ];
};