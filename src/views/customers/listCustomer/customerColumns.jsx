import React from 'react'
import Link from 'next/link'
import { Chip, Avatar, Typography, IconButton, Box } from '@mui/material'
import { Icon } from '@iconify/react'

import { formatCurrency } from '@/utils/currencyUtils'
import { formatDate } from '@/utils/dateUtils'
import { actionButtons } from '@/data/dataSets'

// Action cell extracted into its own component so hooks are used at the top level
const ActionCell = ({ row, handlers, permissions }) => {
  const viewAction = actionButtons.find(action => action.id === 'view')
  const deleteAction = actionButtons.find(action => action.id === 'delete')
  const activateAction = actionButtons.find(action => action.id === 'activate')
  const deactivateAction = actionButtons.find(action => action.id === 'deactivate')

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
      {/* View Button */}
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

      {/* Activate/Deactivate Button */}
      {permissions.canEdit && row.status === 'Deactive' && (
        <IconButton
          size="small"
          onClick={() => handlers.handleActivateClick(row, null)}
          title={activateAction.title}
          color="success"
        >
          <Icon icon={activateAction.icon} />
        </IconButton>
      )}

      {permissions.canEdit && row.status === 'Active' && (
        <IconButton
          size="small"
          onClick={() => handlers.handleDeactivateClick(row, null)}
          title={deactivateAction.title}
          color="warning"
        >
          <Icon icon={deactivateAction.icon} />
        </IconButton>
      )}

      {/* Delete Button */}
      {permissions.canDelete && (
        <IconButton
          size="small"
          onClick={() => handlers.handleDeleteClick(row)}
          title={deleteAction.title}
          color="error"
        >
          <Icon icon={deleteAction.icon} />
        </IconButton>
      )}
    </Box>
  )
}

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

    renderCell: (row) => (
      <Chip
        
        size='small'
        variant='tonal'
        label={row.status === 'Deactive' ? 'Inactive' : (row.status || 'Active')}
        color={row.status === 'Active' ? 'success' : 'warning'}
      />
    )
  },
  {
    key: 'action',
    label: '',
    visible: true,
    align: 'right',
   
    renderCell: (row, handlers) => (
      <ActionCell row={row} handlers={handlers} permissions={permissions} />
    )
  }
]

