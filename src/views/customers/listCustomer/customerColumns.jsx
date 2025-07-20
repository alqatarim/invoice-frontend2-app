import React from 'react'
import Link from 'next/link'
import { Chip, Avatar, Typography, IconButton, Menu, MenuItem, Box } from '@mui/material'
import { MoreVert as MoreVertIcon } from '@mui/icons-material'
import { Icon } from '@iconify/react'

import { formatCurrency } from '@/utils/currencyUtils'
import { formatDate } from '@/utils/dateUtils'
import OptionMenu from '@core/components/option-menu'
import { actionButtons } from '@/data/dataSets'

export const getCustomerColumns = ({ theme, permissions }) => [
  {
    key: 'serial',
    label: '#',
    visible: true,
    align: 'center',
    minWidth: 60,
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
    key: 'name',
    label: 'Name',
    visible: true,
    sortable: true,
    minWidth: 100, // Stable width for primary identifier column
    renderCell: (row) => (
      <Link href={`/customers/customer-view/${row._id}`} passHref>
        <Box className="flex justify-start items-center flex-wrap gap-3 cursor-pointer">
          <Avatar
            src={row.image ? `${process.env.NEXT_PUBLIC_API_URL}/${row.image}` : ''}
            sx={{ width: 40, height: 40 }}
          >
            {row.name?.charAt(0)?.toUpperCase() || 'C'}
          </Avatar>
          <div className="min-w-0">
            <Typography
              variant="body1"
              className='text-[0.9rem] text-start text-primary hover:underline font-medium truncate'
            >
              {row.name || 'N/A'}
            </Typography>
            <Typography variant="caption" color="text.secondary" className='text-[0.8rem] truncate'>
              {row.email || 'No email'}
            </Typography>
          </div>
        </Box>
      </Link>



      
        // <div className="min-w-0">
        //   <Typography
        //     variant="body1"
        //     className='text-[0.9rem] text-start text-primary hover:underline font-medium truncate'
        //   >
        //     {row.name || 'N/A'}
        //   </Typography>
        //   <Typography variant="caption" color="text.secondary" className='text-[0.8rem] truncate'>
        //     {row.email || 'No email'}
        //   </Typography>
        // </div>
    
    )
  },
  {
    key: 'phone',
    label: 'Phone',
    visible: true,
    sortable: true,
    align: 'left',
    minWidth: 140, // Stable width for contact info
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
    minWidth: 120, // Stable width for financial data
    renderCell: (row) => (
      <Typography variant="body1" color='text.primary' className='text-[0.9rem] whitespace-nowrap'>
        {formatCurrency(row.balance)}
      </Typography>
    )
  },
  {
    key: 'totalInvoices',
    label: 'Total Invoices',
    visible: true,
    sortable: true,
    align: 'center',
    minWidth: 110, // Stable width for numerical data
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
    minWidth: 130, // Stable width for dates
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
    minWidth: 90, // Stable width for status chips
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
    minWidth: 130, // Stable width for action buttons
    renderCell: (row, handlers) => {
      const viewAction = actionButtons.find(action => action.id === 'view');
      const editAction = actionButtons.find(action => action.id === 'edit');
      const deleteAction = actionButtons.find(action => action.id === 'delete');
      const activateAction = actionButtons.find(action => action.id === 'activate');
      const deactivateAction = actionButtons.find(action => action.id === 'deactivate');

      const menuOptions = [];

      // Add additional menu options (not view/edit)
      if (permissions.canEdit && row.status === 'Active') {
        menuOptions.push({
          text: deactivateAction.label,
          icon: <Icon icon={deactivateAction.icon} />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.handleDeactivateClick(row)
          }
        });
      }

      if (permissions.canEdit && row.status !== 'Active') {
        menuOptions.push({
          text: activateAction.label,
          icon: <Icon icon={activateAction.icon} />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.handleActivateClick(row)
          }
        });
      }

      if (permissions.canDelete) {
        menuOptions.push({
          text: deleteAction.label,
          icon: <Icon icon={deleteAction.icon} />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-red-500',
            onClick: () => handlers.handleDeleteClick(row)
          }
        });
      }

      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Direct action buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {permissions.canView && (
              <IconButton
                size="small"
                component={Link}
                href={`/customers/customer-view/${row._id}`}
                title={viewAction.title}
              >
                <Icon icon={viewAction.icon} />
              </IconButton>
            )}
            {permissions.canEdit && (
              <IconButton
                size="small"
                component={Link}
                href={`/customers/customer-view/${row._id}`}
                title={editAction.title}
              >
                <Icon icon={editAction.icon} />
              </IconButton>
            )}
          </Box>

          {/* Menu for additional actions */}
          {menuOptions.length > 0 && (
            <OptionMenu
              icon={<MoreVertIcon />}
              iconButtonProps={{ size: 'small', 'aria-label': 'more actions' }}
              options={menuOptions}
            />
          )}
        </Box>
      );
    }
  }
]

