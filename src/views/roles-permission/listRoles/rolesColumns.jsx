'use client'

import { Button, Box, Typography, TextField, IconButton, CircularProgress } from '@mui/material'
import { Icon } from '@iconify/react'
import { formatDate } from '@/utils/dateUtils'
import CustomButton from '@core/components/mui/CustomIconButton'

// Smart icon mapping function based on role name analysis
const getRoleIcon = (roleName) => {
  if (!roleName) return 'mdi:account-circle'
  
  const name = roleName.toLowerCase()
  
  // Admin roles
  if (name.includes('admin') || name.includes('administrator')) {
    return 'mdi:shield-crown'
  }
  
  // Super admin / Owner roles
  if (name.includes('super') || name.includes('owner') || name.includes('root')) {
    return 'mdi:crown'
  }
  
  // Manager / Lead roles
  if (name.includes('manager') || name.includes('lead') || name.includes('supervisor') || name.includes('director')) {
    return 'mdi:account-tie'
  }
  
  // Developer / Engineer roles
  if (name.includes('developer') || name.includes('engineer') || name.includes('programmer') || name.includes('dev')) {
    return 'mdi:code-tags'
  }
  
  // Designer roles
  if (name.includes('designer') || name.includes('ui') || name.includes('ux')) {
    return 'mdi:palette'
  }
  
  // Sales / Marketing roles
  if (name.includes('sales') || name.includes('marketing') || name.includes('account')) {
    return 'mdi:chart-line'
  }
  
  // Support / Customer Service roles
  if (name.includes('support') || name.includes('service') || name.includes('help')) {
    return 'mdi:headset'
  }
  
  // HR / People roles
  if (name.includes('hr') || name.includes('human') || name.includes('people') || name.includes('recruitment')) {
    return 'mdi:account-group'
  }
  
  // Finance / Accounting roles
  if (name.includes('finance') || name.includes('accounting') || name.includes('accountant')) {
    return 'mdi:calculator'
  }
  
  // Analyst / Data roles
  if (name.includes('analyst') || name.includes('data') || name.includes('analytics')) {
    return 'mdi:chart-bar'
  }
  
  // Editor / Content roles
  if (name.includes('editor') || name.includes('content') || name.includes('writer')) {
    return 'mdi:pencil'
  }
  
  // Viewer / Guest / Basic User roles
  if (name.includes('viewer') || name.includes('guest') || name.includes('read') || name === 'user' || name === 'member') {
    return 'mdi:eye'
  }
  
  // Default icon for unrecognized roles
  return 'mdi:account-circle'
}

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
         align: 'center',
      renderCell: (row) => {
        const isEditing = editingRoleId === row._id
        const isSuperAdmin = row?.roleName === 'Super Admin'
        const canEditRole = canEdit && !isSuperAdmin
        


        return (
          <Box className="flex justify-center items-center gap-2 group">
            <TextField
              size="small"
              variant="outlined"
              value={isEditing ? editingValue : (row?.roleName || 'Unknown Role')}
              onChange={isEditing ? (e) => handleInlineEditChange(e.target.value) : undefined}
              onKeyDown={isEditing ? (e) => {
                if (e.key === 'Enter') {
                  handleSaveInlineEdit()
                } else if (e.key === 'Escape') {
                  handleCancelInlineEdit()
                }
              } : undefined}
              disabled={isEditing && inlineLoading}
              InputProps={{
                readOnly: !isEditing,
                startAdornment: (
                  <Box className="mr-2 flex items-center">
                    <Icon 
                      icon={getRoleIcon(isEditing ? editingValue : row?.roleName)} 
                      fontSize={18}
                      className="text-primary"
                    />
                  </Box>
                ),
                sx: {
                  '& .MuiOutlinedInput-input': {
                    cursor: !isEditing && canEditRole ? 'pointer' : isEditing ? 'text' : 'default',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    color: 'primary.main',
                    backgroundColor: 'transparent'
                  },
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'transparent',
                    '&:hover': canEditRole && !isEditing ? {
                      borderColor: 'primary.main'
                    } : {}
                  },
                  '& .MuiInputAdornment-root': {
                    marginRight: '8px'
                  },
                  borderRadius: '8px',
                  backgroundColor: 'transparent'
                }
              }}
              onClick={!isEditing && canEditRole ? () => handleStartInlineEdit(row) : undefined}
              title={canEditRole ? 'Click to edit role name' : undefined}
              className="flex-1 min-w-[200px]"
              autoFocus={isEditing}
            />
            {canEditRole && !isEditing && (
              <IconButton
                size="small"
                onClick={() => handleStartInlineEdit(row)}
                className="opacity-60 group-hover:opacity-100 transition-opacity p-1"
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { 
                    color: 'primary.main',
                    backgroundColor: 'primary.light'
                  }
                }}
              >
                <Icon icon="mdi:pencil" fontSize={16} />
              </IconButton>
            )}
            {isEditing && (
              <>
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
              </>
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
        return (
          <CustomButton
            variant="tonal"
            color="primary"
            size="small"
            skin="lighter"
            onClick={() => handleViewPermissions?.(row?._id)}

          >
            <Box className='flex items-center gap-3 px-1'>
              <Icon icon="mdi:key" />
              <Typography variant="h6" color='primary' className='text-[0.9rem]'>Permissions</Typography>
            </Box>
          </CustomButton>
        )
      },
    }
  ]
}

export default rolesColumns