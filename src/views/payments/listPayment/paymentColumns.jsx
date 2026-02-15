'use client';

import Link from 'next/link';
import { Box, Typography, Avatar, Chip } from '@mui/material';
import { Icon } from '@iconify/react';
import { formatDate } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/currencyUtils';
import { useTheme } from '@mui/material/styles';
import { actionButtons } from '@/data/dataSets';
import OptionMenu from '@core/components/option-menu';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

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
          variant="body1"
          color="primary"
          className="text-[0.9rem] font-medium"
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
              variant="body1"
              className="text-[0.9rem] font-medium"
              component={Link}
              href={`/customers/customer-view/${row.customerDetail?._id}`}
              sx={{ textDecoration: 'none' }}
            >
              {row.customerDetail?.name || 'Deleted Customer'}
            </Typography>
            <Typography variant="caption" display="block" className="text-[0.8rem]">
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
        <Typography variant="body1" className="text-[0.9rem]">
          {formatCurrency(row.amount)}
        </Typography>
      ),
    },
    {
      key: 'payment_date',
      label: 'Payment Date',
      visible: true,
      sortable: true,
      renderCell: (row) => (
        <Typography variant="body1" className="text-[0.9rem]">
          {formatDate(row.createdAt)}
        </Typography>
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
          <Typography variant="body1" className="text-[0.9rem]">
            {row.payment_method}
          </Typography>
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
      label: '',
      visible: true,
      sortable: false,
      renderCell: (row, cellHandlers) => {
        const viewAction = actionButtons.find(action => action.id === 'view');
        const editAction = actionButtons.find(action => action.id === 'edit');
        const deleteAction = actionButtons.find(action => action.id === 'delete');
        const permissions = cellHandlers?.permissions || {};

        const menuOptions = [];

        if (permissions.canView) {
          menuOptions.push({
            text: viewAction?.label || 'View',
            icon: <Icon icon={viewAction?.icon || 'mdi:eye-outline'} />,
            menuItemProps: {
              className: 'flex items-center gap-2 text-textSecondary',
              onClick: () => cellHandlers?.handleView?.(row._id)
            }
          });
        }

        if (permissions.canUpdate) {
          menuOptions.push({
            text: editAction?.label || 'Edit',
            icon: <Icon icon={editAction?.icon || 'mdi:edit-outline'} />,
            menuItemProps: {
              className: 'flex items-center gap-2 text-textSecondary',
              onClick: () => cellHandlers?.handleEdit?.(row._id)
            }
          });
        }

        if (permissions.canDelete && row.status !== 'Cancelled') {
          menuOptions.push({
            text: deleteAction?.label || 'Delete',
            icon: <Icon icon={deleteAction?.icon || 'mdi:delete-outline'} />,
            menuItemProps: {
              className: 'flex items-center gap-2 text-textSecondary',
              onClick: () => cellHandlers?.handleDelete?.(row._id)
            }
          });
        }

        if (menuOptions.length === 0) return null;

        return (
          <Box className='flex items-center justify-end'>
            <OptionMenu
              icon={<MoreVertIcon />}
              iconButtonProps={{ size: 'small', 'aria-label': 'payment actions' }}
              options={menuOptions}
            />
          </Box>
        );
      },
    },
  ];
};