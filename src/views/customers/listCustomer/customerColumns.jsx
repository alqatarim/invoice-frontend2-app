import React from 'react'
import { Chip, Avatar, Typography, IconButton, Menu, MenuItem } from '@mui/material'
import { Icon } from '@iconify/react'
import { formatCurrency } from '@/utils/currencyUtils'
import { formatDate } from '@/utils/dateUtils'

export const getCustomerColumns = ({ theme, permissions }) => [
  {
    key: 'serial',
    label: '#',
    visible: true,
    width: 60,
    renderCell: (row, { pagination }) => {
      const { current, pageSize } = pagination || { current: 1, pageSize: 10 }
      const index = row._index !== undefined ? row._index : 0
      return (current - 1) * pageSize + index + 1
    }
  },
  {
    key: 'customer',
    label: 'Customer',
    visible: true,
    width: 280,
    renderCell: (row) => (
      <div className="flex items-center gap-3">
        <Avatar
          src={row.image ? `${process.env.NEXT_PUBLIC_API_URL}/${row.image}` : ''}
          sx={{ width: 40, height: 40 }}
        >
          {row.name?.charAt(0)?.toUpperCase() || 'C'}
        </Avatar>
        <div>
          <Typography variant="body2" className="font-medium">
            {row.name || 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.email || 'No email'}
          </Typography>
        </div>
      </div>
    )
  },
  {
    key: 'phone',
    label: 'Phone',
    visible: true,
    width: 130,
    renderCell: (row) => (
      <Typography variant="body2">
        {row.phone || 'N/A'}
      </Typography>
    )
  },
  {
    key: 'balance',
    label: 'Balance',
    visible: true,
    width: 120,
    renderCell: (row) => (
      <Typography variant="body2" className="font-medium">
        {formatCurrency(row.balance || 0)}
      </Typography>
    )
  },
  {
    key: 'totalInvoices',
    label: 'Total Invoices',
    visible: true,
    width: 120,
    renderCell: (row) => (
      <Typography variant="body2">
        {row.totalInvoices || 0}
      </Typography>
    )
  },
  {
    key: 'createdAt',
    label: 'Created On',
    visible: true,
    width: 130,
    renderCell: (row) => (
      <Typography variant="body2">
        {formatDate(row.createdAt)}
      </Typography>
    )
  },
  {
    key: 'status',
    label: 'Status',
    visible: true,
    width: 100,
    renderCell: (row) => (
      <Chip
        label={row.status || 'Active'}
        size="small"
        color={row.status === 'Active' ? 'success' : 'default'}
        variant="outlined"
      />
    )
  },
  {
    key: 'actions',
    label: 'Action',
    visible: true,
    width: 80,
    renderCell: (row, { handleMenuOpen, handleEdit, handleView, handleDelete, handleStatusToggle, permissions }) => (
      <CustomerActionMenu
        customer={row}
        permissions={permissions}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onStatusToggle={handleStatusToggle}
      />
    )
  }
]

// Customer Action Menu Component
const CustomerActionMenu = ({ customer, permissions, onEdit, onView, onDelete, onStatusToggle }) => {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleMenuAction = (action, data) => {
    handleClose()
    action(data)
  }

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        aria-controls={open ? 'customer-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Icon icon="tabler:dots-vertical" />
      </IconButton>
      <Menu
        id="customer-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'customer-button',
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {permissions.canView && (
          <MenuItem onClick={() => handleMenuAction(onView, customer)}>
            <Icon icon="tabler:eye" className="mr-2" />
            View
          </MenuItem>
        )}
        {permissions.canUpdate && (
          <MenuItem onClick={() => handleMenuAction(onEdit, customer)}>
            <Icon icon="tabler:edit" className="mr-2" />
            Edit
          </MenuItem>
        )}
        {permissions.canUpdate && (
          <MenuItem onClick={() => handleMenuAction(onStatusToggle, customer)}>
            <Icon 
              icon={customer.status === 'Active' ? "tabler:user-off" : "tabler:user-check"} 
              className="mr-2" 
            />
            {customer.status === 'Active' ? 'Deactivate' : 'Activate'}
          </MenuItem>
        )}
        {permissions.canDelete && (
          <MenuItem 
            onClick={() => handleMenuAction(onDelete, customer)}
            sx={{ color: 'error.main' }}
          >
            <Icon icon="tabler:trash" className="mr-2" />
            Delete
          </MenuItem>
        )}
      </Menu>
    </>
  )
}