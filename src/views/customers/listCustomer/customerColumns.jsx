import React from 'react'
import Link from 'next/link'
import { Chip, Avatar, Typography, IconButton, Menu, MenuItem } from '@mui/material'
import { MoreVert as MoreVertIcon } from '@mui/icons-material'
import { Icon } from '@iconify/react'

import { formatCurrency } from '@/utils/currencyUtils'
import { formatDate } from '@/utils/dateUtils'
import OptionMenu from '@core/components/option-menu'

export const getCustomerColumns = ({ theme, permissions }) => [
  {
    key: 'serial',
    label: '#',
    visible: true,
    width: 60,
    align: 'center',
    renderCell: (row, { pagination }) => {
      const { current, pageSize } = pagination || { current: 1, pageSize: 10 }
      const index = row._index !== undefined ? row._index : 0
      return (
        <Typography variant="body1" color='text.primary' className='text-[0.9rem]'>
          {(current - 1) * pageSize + index + 1}
        </Typography>
      )
    }
  },
  {
    key: 'customer',
    label: 'Customer',
    visible: true,
    sortable: true,
    renderCell: (row) => (
      <Link href={`/customers/customer-view/${row._id}`} passHref>
        <div className="flex items-center gap-3 cursor-pointer">
          <Avatar
            src={row.image ? `${process.env.NEXT_PUBLIC_API_URL}/${row.image}` : ''}
            sx={{ width: 40, height: 40 }}
          >
            {row.name?.charAt(0)?.toUpperCase() || 'C'}
          </Avatar>
          <div>
            <Typography
              variant="body1"
              className='text-[0.9rem] text-start text-primary hover:underline font-medium'
            >
              {row.name || 'N/A'}
            </Typography>
            <Typography variant="caption" color="text.secondary" className='text-[0.8rem]'>
              {row.email || 'No email'}
            </Typography>
          </div>
        </div>
      </Link>
    )
  },
  {
    key: 'phone',
    label: 'Phone',
    visible: true,
    sortable: true,
    align: 'center',
    renderCell: (row) => (
      <Typography variant="body1" color='text.primary' className='text-[0.9rem] whitespace-nowrap'>
        {row.phone || 'N/A'}
      </Typography>
    )
  },
  {
    key: 'balance',
    label: 'Balance',
    visible: true,
    sortable: true,
    align: 'center',
    renderCell: (row) => (
      <div className="flex items-center gap-1 justify-center">
        <Icon icon="lucide:saudi-riyal" width="1rem" color={theme.palette.secondary.light} />
        <Typography variant="body1" color='text.primary' className='text-[0.9rem] font-medium'>
          {(row.balance || 0).toLocaleString()}
        </Typography>
      </div>
    )
  },
  {
    key: 'totalInvoices',
    label: 'Total Invoices',
    visible: true,
    sortable: true,
    align: 'center',
    renderCell: (row) => (
      <Typography variant="body1" color='text.primary' className='text-[0.9rem]'>
        {row.noOfInvoices || row.invoiceRecs?.length || row.totalInvoices || 0}
      </Typography>
    )
  },
  {
    key: 'createdAt',
    label: 'Created On',
    visible: true,
    sortable: true,
    align: 'center',
    renderCell: (row) => (
      <Typography variant="body1" color='text.primary' className='text-[0.9rem] whitespace-nowrap'>
        {row.createdAt ? formatDate(row.createdAt) : 'N/A'}
      </Typography>
    )
  },
  {
    key: 'status',
    label: 'Status',
    visible: true,
    sortable: true,
    align: 'center',
    renderCell: (row) => (
      <Chip
        className='mx-0'
        size='small'
        variant='tonal'
        label={row.status || 'Active'}
        color={row.status === 'Active' ? 'success' : 'default'}
      />
    )
  },
  {
    key: 'action',
    label: '',
    visible: true,
    align: 'right',
    renderCell: (row, handlers) => {
      const options = [];

      if (permissions.canView) {
        options.push({
          text: 'View',
          icon: <Icon icon="mdi:eye-outline" />,
          href: `/customers/customer-view/${row._id}`,
          linkProps: {
            className: 'flex items-center is-full plb-2 pli-4 gap-2 text-textSecondary'
          }
        });
      }

      if (permissions.canUpdate) {
        options.push({
          text: 'Edit',
          icon: <Icon icon="mdi:edit-outline" />,
          href: `/customers/customer-edit/${row._id}`,
          linkProps: {
            className: 'flex items-center is-full plb-2 pli-4 gap-2 text-textSecondary'
          }
        });
      }

      if (permissions.canUpdate && row.status === 'Active') {
        options.push({
          text: 'Deactivate',
          icon: <Icon icon="mdi:account-off-outline" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.handleDeactivateClick(row)
          }
        });
      }

      if (permissions.canUpdate && row.status !== 'Active') {
        options.push({
          text: 'Activate',
          icon: <Icon icon="mdi:account-check-outline" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.handleActivateClick(row)
          }
        });
      }

      if (permissions.canDelete) {
        options.push({
          text: 'Delete',
          icon: <Icon icon="mdi:delete-outline" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-red-500',
            onClick: () => handlers.handleDeleteClick(row)
          }
        });
      }

      return (
        <OptionMenu
          icon={<MoreVertIcon />}
          iconButtonProps={{ size: 'small', 'aria-label': 'more actions' }}
          options={options}
        />
      );
    }
  }
]

