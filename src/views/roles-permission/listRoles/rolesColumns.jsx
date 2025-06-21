'use client'

import { Button, Box, Typography, TextField, IconButton, CircularProgress } from '@mui/material'
import { Icon } from '@iconify/react'
import { formatDate } from '@/utils/dateUtils'
import OptionMenu from '@core/components/option-menu'

const rolesColumns = ({ 
  handleEdit, 
  handleViewPermissions, 
  canEdit,
  // Inline editing props
  editingRoleId,
  editingValue,
  inlineLoading,
  handleStartInlineEdit,
  handleInlineEditChange,
  handleSaveInlineEdit,
  handleCancelInlineEdit
}) => {
  return [
    {
      key: 'id',
      label: 'ID',
      visible: true,
      sortable: true,
      align: 'center',
      renderCell: (row) => (
        <Typography variant="body1" color='text.primary' className='text-[0.9rem]'>
          {row.id || 'N/A'}
        </Typography>
      ),
    },
    {
      key: 'roleName',
      label: 'Role Name',
      visible: true,
      sortable: true,
      renderCell: (row) => {
        const isEditing = editingRoleId === row._id
        const isSuperAdmin = row?.roleName === 'Super Admin'
        const canEditRole = canEdit && !isSuperAdmin
        
        if (isEditing) {
          return (
            <Box className="flex items-center gap-2 min-w-[200px]">
              <TextField
                size="small"
                value={editingValue}
                onChange={(e) => handleInlineEditChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveInlineEdit()
                  } else if (e.key === 'Escape') {
                    handleCancelInlineEdit()
                  }
                }}
                disabled={inlineLoading}
                autoFocus
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  }
                }}
                className="flex-1"
              />
              <IconButton
                size="small"
                onClick={handleSaveInlineEdit}
                disabled={inlineLoading || !editingValue?.trim()}
                color="success"
                className="p-1"
              >
                {inlineLoading ? (
                  <CircularProgress size={16} />
                ) : (
                  <Icon icon="mdi:check" fontSize={16} />
                )}
              </IconButton>
              <IconButton
                size="small"
                onClick={handleCancelInlineEdit}
                disabled={inlineLoading}
                color="error" 
                className="p-1"
              >
                <Icon icon="mdi:close" fontSize={16} />
              </IconButton>
            </Box>
          )
        }

        return (
          <Box className="flex items-center gap-2 group">
            <Typography
              variant="body1"
              className={`text-[0.9rem] text-start font-medium text-primary ${
                canEditRole ? 'cursor-pointer hover:text-primary-600' : ''
              }`}
              onClick={canEditRole ? () => handleStartInlineEdit(row) : undefined}
              title={canEditRole ? 'Click to edit role name' : row?.roleName}
            >
              {row?.roleName || 'Unknown Role'}
            </Typography>
            {canEditRole && (
              <IconButton
                size="small"
                onClick={() => handleStartInlineEdit(row)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { 
                    color: 'primary.main',
                    backgroundColor: 'primary.light'
                  }
                }}
              >
                <Icon icon="mdi:pencil" fontSize={14} />
              </IconButton>
            )}
          </Box>
        )
      },
    },
    {
      key: 'createdAt',
      label: 'Created On',
      visible: true,
      sortable: true,
      align: 'center',
      renderCell: (row) => (
        <Typography variant="body1" color='text.primary' className='text-[0.9rem] whitespace-nowrap'>
          {row?.createdAt ? formatDate(row.createdAt) : 'N/A'}
        </Typography>
      ),
    },
    {
      key: 'action',
      label: 'Actions',
      visible: true,
      align: 'right',
      renderCell: (row) => {
        const isSuperAdmin = row?.roleName === 'Super Admin'
        const options = []

        // Add permissions view option
        options.push({
          text: 'View Permissions',
          icon: <Icon icon="mdi:lock-outline" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handleViewPermissions?.(row?._id)
          }
        })

        // Note: Removed the Edit Role option since we now have inline editing
        // If you still want to keep the modal edit option, you can uncomment below:
        // if (canEdit && !isSuperAdmin) {
        //   options.push({
        //     text: 'Edit Role',
        //     icon: <Icon icon="mdi:edit-outline" />,
        //     menuItemProps: {
        //       className: 'flex items-center gap-2 text-textSecondary',
        //       onClick: () => handleEdit?.(row)
        //     }
        //   })
        // }

        return (
          <OptionMenu
            icon={<Icon icon="mdi:dots-vertical" />}
            iconButtonProps={{ size: 'small', 'aria-label': 'more actions' }}
            options={options}
          />
        )
      },
    }
  ]
}

export default rolesColumns