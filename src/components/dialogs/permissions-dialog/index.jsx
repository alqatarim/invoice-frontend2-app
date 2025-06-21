'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Paper,
  Divider,
  IconButton,
  CircularProgress,
  FormControlLabel,
  Chip,
  useTheme,
  alpha,
} from '@mui/material'
import { Icon } from '@iconify/react'
import { useSnackbar } from 'notistack'
import { getPermissionsByRoleId, updatePermissions } from '@/app/(dashboard)/roles-permission/actions'

const PermissionsDialog = ({ open, onClose, roleId, roleName }) => {
  const theme = useTheme()
  const { enqueueSnackbar } = useSnackbar()
  
  // State management
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [permissions, setPermissions] = useState(null)
  const [originalPermissions, setOriginalPermissions] = useState(null)
  const [permissionId, setPermissionId] = useState(null)

  // Special modules that are always enabled
  const alwaysEnabledModules = ['dashboard', 'accountSettings']

  // Utility function to convert camelCase to spaced string
  const camelCaseToSpaced = (camelCaseString) => {
    return camelCaseString
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
  }

  // Load permissions data
  const loadPermissions = async () => {
    if (!roleId) return

    setLoading(true)
    try {
      const result = await getPermissionsByRoleId(roleId)
      
      if (result && result.permissions) {
        setPermissions(result.permissions)
        setOriginalPermissions(JSON.parse(JSON.stringify(result.permissions)))
        setPermissionId(result.permissions._id)
      } else {
        enqueueSnackbar('No permissions data found', { variant: 'warning' })
      }
    } catch (error) {
      console.error('Error loading permissions:', error)
      enqueueSnackbar(error.message || 'Error loading permissions', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open && roleId) {
      loadPermissions()
    } else if (!open) {
      setPermissions(null)
      setOriginalPermissions(null)
      setPermissionId(null)
    }
  }, [open, roleId])

  // Handle All Modules toggle
  const handleAllModulesChange = (checked) => {
    if (!permissions) return

    const updatedPermissions = {
      ...permissions,
      allModules: checked,
      modules: permissions.modules.map(module => ({
        ...module,
        permissions: {
          create: checked,
          update: checked,
          delete: checked,
          view: checked,
          all: checked
        }
      }))
    }

    setPermissions(updatedPermissions)
  }

  // Handle individual permission change
  const handlePermissionChange = (moduleIndex, permissionType, checked) => {
    if (!permissions) return

    const updatedModules = [...permissions.modules]
    updatedModules[moduleIndex] = {
      ...updatedModules[moduleIndex],
      permissions: {
        ...updatedModules[moduleIndex].permissions,
        [permissionType]: checked
      }
    }

    // Update 'all' permission based on other permissions
    const modulePermissions = updatedModules[moduleIndex].permissions
    const allPermissionsChecked = ['create', 'update', 'delete', 'view'].every(
      perm => modulePermissions[perm]
    )
    updatedModules[moduleIndex].permissions.all = allPermissionsChecked

    // Check if all modules have all permissions to update global allModules
    const allModulesChecked = updatedModules.every(module => 
      module.permissions.all || alwaysEnabledModules.includes(module.module)
    )

    setPermissions({
      ...permissions,
      allModules: allModulesChecked,
      modules: updatedModules
    })
  }

  // Handle module "all" permission toggle
  const handleModuleAllChange = (moduleIndex, checked) => {
    if (!permissions) return

    const updatedModules = [...permissions.modules]
    updatedModules[moduleIndex] = {
      ...updatedModules[moduleIndex],
      permissions: {
        create: checked,
        update: checked,
        delete: checked,
        view: checked,
        all: checked
      }
    }

    // Check if all modules have all permissions to update global allModules
    const allModulesChecked = updatedModules.every(module => 
      module.permissions.all || alwaysEnabledModules.includes(module.module)
    )

    setPermissions({
      ...permissions,
      allModules: allModulesChecked,
      modules: updatedModules
    })
  }

  // Handle save permissions
  const handleSave = async () => {
    if (!permissions || !permissionId) {
      enqueueSnackbar('No permissions data to save', { variant: 'error' })
      return
    }

    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('permissionId', permissionId)
      formData.append('allModules', permissions.allModules.toString())
      formData.append('modules', JSON.stringify(permissions.modules))

      const result = await updatePermissions(formData)

      if (result.success) {
        enqueueSnackbar(result.message, { variant: 'success' })
        setOriginalPermissions(JSON.parse(JSON.stringify(permissions)))
        onClose()
      } else {
        enqueueSnackbar(result.error || 'Failed to update permissions', { variant: 'error' })
      }
    } catch (error) {
      console.error('Error updating permissions:', error)
      enqueueSnackbar('Error updating permissions', { variant: 'error' })
    } finally {
      setSaving(false)
    }
  }

  // Handle cancel - reset to original permissions
  const handleCancel = () => {
    if (originalPermissions) {
      setPermissions(JSON.parse(JSON.stringify(originalPermissions)))
    }
    onClose()
  }

  // Check if permissions have changed
  const hasChanges = () => {
    if (!permissions || !originalPermissions) return false
    return JSON.stringify(permissions) !== JSON.stringify(originalPermissions)
  }

  const isAdmin = permissions?.allModules || false

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          minHeight: '80vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          p: 3,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`
        }}
      >
        <Box className="flex items-center justify-between">
          <Box className="flex items-center gap-3">
            <Box
              className="p-2 rounded-lg flex items-center justify-center"
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main
              }}
            >
              <Icon icon="mdi:shield-lock-outline" fontSize={24} />
            </Box>
            <Box>
              <Typography variant="h5" className="font-semibold">
                Permissions Management
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-1">
                Configure permissions for role: <strong>{roleName}</strong>
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleCancel} disabled={loading || saving}>
            <Icon icon="mdi:close" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box className="flex items-center justify-center py-20">
            <Box className="text-center">
              <CircularProgress size={48} thickness={4} />
              <Typography variant="body1" className="mt-4" color="text.secondary">
                Loading permissions...
              </Typography>
            </Box>
          </Box>
        ) : permissions ? (
          <Box className="p-6">
            {/* Global All Modules Toggle */}
            <Box 
              className="p-4 rounded-lg mb-6"
              sx={{ 
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isAdmin}
                    onChange={(e) => handleAllModulesChange(e.target.checked)}
                    disabled={saving}
                    size="medium"
                  />
                }
                label={
                  <Box className="flex items-center gap-2">
                    <Typography variant="h6" className="font-semibold">
                      Grant All Permissions
                    </Typography>
                    <Chip 
                      label="Admin Access" 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                }
              />
              <Typography variant="body2" color="text.secondary" className="ml-8">
                Enable all permissions across all modules for this role
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Permissions Table */}
            <Paper 
              variant="outlined" 
              sx={{ 
                borderRadius: '12px',
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell 
                      sx={{ 
                        backgroundColor: alpha(theme.palette.grey[50], 0.8),
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}
                    >
                      Module
                    </TableCell>
                    <TableCell 
                      align="center"
                      sx={{ 
                        backgroundColor: alpha(theme.palette.grey[50], 0.8),
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}
                    >
                      Create
                    </TableCell>
                    <TableCell 
                      align="center"
                      sx={{ 
                        backgroundColor: alpha(theme.palette.grey[50], 0.8),
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}
                    >
                      Update
                    </TableCell>
                    <TableCell 
                      align="center"
                      sx={{ 
                        backgroundColor: alpha(theme.palette.grey[50], 0.8),
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}
                    >
                      Delete
                    </TableCell>
                    <TableCell 
                      align="center"
                      sx={{ 
                        backgroundColor: alpha(theme.palette.grey[50], 0.8),
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}
                    >
                      View
                    </TableCell>
                    <TableCell 
                      align="center"
                      sx={{ 
                        backgroundColor: alpha(theme.palette.grey[50], 0.8),
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}
                    >
                      All
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {permissions.modules?.map((module, index) => {
                    const isAlwaysEnabled = alwaysEnabledModules.includes(module.module)
                    const isDisabled = saving || isAdmin || isAlwaysEnabled

                    return (
                      <TableRow 
                        key={module.module}
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: alpha(theme.palette.primary.main, 0.02) 
                          }
                        }}
                      >
                        <TableCell>
                          <Box className="flex items-center gap-2">
                            <Typography variant="body1" className="font-medium">
                              {module.label}
                            </Typography>
                            {isAlwaysEnabled && (
                              <Chip 
                                label="System" 
                                size="small" 
                                color="default" 
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={module.permissions?.create || false}
                            onChange={(e) => handlePermissionChange(index, 'create', e.target.checked)}
                            disabled={isDisabled}
                            color="success"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={module.permissions?.update || false}
                            onChange={(e) => handlePermissionChange(index, 'update', e.target.checked)}
                            disabled={isDisabled}
                            color="warning"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={module.permissions?.delete || false}
                            onChange={(e) => handlePermissionChange(index, 'delete', e.target.checked)}
                            disabled={isDisabled}
                            color="error"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={module.permissions?.view || false}
                            onChange={(e) => handlePermissionChange(index, 'view', e.target.checked)}
                            disabled={isDisabled}
                            color="info"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={module.permissions?.all || false}
                            onChange={(e) => handleModuleAllChange(index, e.target.checked)}
                            disabled={isDisabled}
                            color="primary"
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Paper>
          </Box>
        ) : (
          <Box className="flex items-center justify-center py-20">
            <Typography variant="body1" color="text.secondary">
              No permissions data available
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions 
        sx={{ 
          p: 3,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          gap: 2
        }}
      >
        <Button
          onClick={handleCancel}
          disabled={saving}
          variant="outlined"
          sx={{ borderRadius: '12px' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges()}
          variant="contained"
          startIcon={
            saving ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <Icon icon="mdi:content-save" />
            )
          }
          sx={{ borderRadius: '12px' }}
        >
          {saving ? 'Updating...' : 'Update Permissions'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PermissionsDialog 