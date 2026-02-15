'use client'

import React from 'react'
import { Button, Box, Typography, TextField, IconButton, CircularProgress, Menu, MenuItem, FormControl, Grid, InputAdornment, ButtonGroup } from '@mui/material'
import { Icon } from '@iconify/react'
import { formatDate } from '@/utils/dateUtils'
import CustomIconButton from '@core/components/mui/CustomIconButtonTwo'
import CustomOriginalIconButton from '@core/components/mui/CustomOriginalIconButton'
import { ROLE_ICONS } from '@/data/dataSets'
import OptionMenu from '@core/components/option-menu'
import { MoreVert as MoreVertIcon } from '@mui/icons-material'

const rolesColumns = ({ 
  handleViewPermissions, 
  canEdit,
  // Inline editing props
  editingRoleId,
  editingValue,
  editingIcon,
  editingMode,
  inlineLoading,
  handleStartNameEdit,
  handleInlineEditChange,
  handleIconChange,
  handleSaveNameEdit,
  handleCancelInlineEdit
}) => {
  // State for Menu anchor
  const [iconMenuAnchor, setIconMenuAnchor] = React.useState(null)

  const handleIconMenuOpen = (event) => {
    setIconMenuAnchor(event.currentTarget)
  }

  const handleIconMenuClose = () => {
    setIconMenuAnchor(null)
  }

  const handleIconSelect = (iconValue) => {
    handleIconChange(iconValue)
    handleIconMenuClose()
  }

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
      align: 'center',
      renderCell: (row) => {
        const isEditingName = editingRoleId === row._id && editingMode === 'name'
        const isSuperAdmin = row?.roleName === 'Super Admin'
        const canEditRole = canEdit && !isSuperAdmin

        // Name editing mode - simple text field with auto-save
        if (isEditingName) {
          return (
            <Box className="flex justify-center items-center gap-2">
              {/* Role Icon (read-only during name edit) */}
              <CustomOriginalIconButton
                color="primary"
                size="medium"
                className="cursor-default"
                disabled
              >
                <Icon 
                  icon={row?.roleIcon || 'mdi:user-circle-outline'} 
                  width={23}
                />
              </CustomOriginalIconButton>

              {/* Role Name Text Field (editable with auto-save) */}
              <TextField
                size="small"
                variant="outlined"
                value={editingValue}
                onChange={(e) => handleInlineEditChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveNameEdit()
                  } else if (e.key === 'Escape') {
                    handleCancelInlineEdit()
                  }
                }}
                onBlur={() => handleSaveNameEdit(true)}
                disabled={inlineLoading}
                placeholder="Role name"
                autoFocus
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
                className="flex-1 min-w-[180px]"
              />

              {/* Loading indicator */}
              {inlineLoading && (
                <CircularProgress size={20} />
              )}
              
              {/* Placeholder space */}
              <Box className="min-w-[80px]" />
            </Box>
          )
        }

        return (
          <Box className="flex justify-center items-center gap-2">
            {/* Role Icon - Click to show immediate icon selector */}
            <FormControl>
              <CustomOriginalIconButton
                color="primary"
                size="medium"
                onClick={canEditRole ? handleIconMenuOpen : undefined}
                className={canEditRole ? "cursor-pointer" : "cursor-default"}
                title={canEditRole ? 'Click to change role icon' : undefined}
                disabled={inlineLoading}
              >
                <Icon 
                  icon={row?.roleIcon || 'mdi:user-circle-outline'} 
                  width={23}
                />
              </CustomOriginalIconButton>
              
              {/* Immediate Icon Selection Menu */}
              <Menu
                anchorEl={iconMenuAnchor}
                open={Boolean(iconMenuAnchor)}
                onClose={handleIconMenuClose}
              >
                <Grid container spacing={1} className='max-w-[300px] p-3'>
                  {ROLE_ICONS.map((iconOption) => (
                    <Grid item xs={'auto'} key={iconOption.value}>
                      <CustomOriginalIconButton
                        size="large"
                        color='primary'
                        onClick={() => {
                          handleIconChange(row, iconOption.value)
                          handleIconMenuClose()
                        }}
                        title={iconOption.label}
                        disabled={inlineLoading}
                      >
                        <Icon icon={iconOption.value} width={23} />
                      </CustomOriginalIconButton>
                    </Grid>
                  ))}
                </Grid>
              </Menu>
            </FormControl>

            {/* Role Name Text Field with Edit Icon as InputAdornment */}
            <TextField
              size="small"
              variant="outlined"
              value={row?.roleName || 'Unknown Role'}
              InputProps={{
                readOnly: true,
                endAdornment: canEditRole && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => handleStartNameEdit(row)}
                      edge="end"
                      color="primary"
                      title="Click to edit role name"
                      disabled={inlineLoading}
                    >
                      <Icon icon="mdi:pencil-outline" width={18} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              onClick={canEditRole ? () => handleStartNameEdit(row) : undefined}
              title={canEditRole ? 'Click to edit role name' : undefined}
              className="flex-1 min-w-[180px] cursor-pointer"
              sx={{
                '& .MuiOutlinedInput-root': {
                  cursor: canEditRole ? 'pointer' : 'default'
                }
              }}
            />

            {/* Loading indicator or placeholder space */}
            <Box className="min-w-[80px] flex justify-center">
              {inlineLoading && (
                <CircularProgress size={20} />
              )}
            </Box>
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
      label: '',
      visible: true,
      align: 'right',
      renderCell: (row) => {
        const menuOptions = [
          {
            text: 'Permissions',
            icon: <Icon icon="mdi:key" />,
            menuItemProps: {
              className: 'flex items-center gap-2 text-textSecondary',
              onClick: () => handleViewPermissions?.(row?._id)
            }
          }
        ]

        return (
          <Box className='flex items-center justify-end'>
            <OptionMenu
              icon={<MoreVertIcon />}
              iconButtonProps={{ size: 'small', 'aria-label': 'role actions' }}
              options={menuOptions}
            />
          </Box>
        )
      },
    }
  ]
}

export default rolesColumns