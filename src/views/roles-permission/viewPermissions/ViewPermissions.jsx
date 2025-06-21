'use client'

import { 
  Card, 
  CardContent, 
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
  Divider
} from '@mui/material'
import { usePermissionsHandler } from '@/handlers/roles-permission/permissions/permissionsHandler'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'

const ViewPermissions = ({ roleId, initialPermissions, roleName }) => {
  const {
    permissions,
    loading,
    isAdmin,
    handleAllModulesChange,
    handleModuleAllChange,
    handlePermissionChange,
    handleSubmit,
    handleBack
  } = usePermissionsHandler(initialPermissions)

  // Special modules that are always enabled
  const alwaysEnabledModules = ['dashboard', 'accountSettings']

  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant='h5'>Permissions Management</Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                Role Name: <strong>{roleName}</strong>
              </Typography>
            </Box>
            <Button
              variant='outlined'
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
            >
              Back
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Permissions Table */}
      <Card>
        <CardContent>
          {/* All Modules Checkbox */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <Checkbox
              checked={permissions?.allModules || false}
              onChange={(e) => handleAllModulesChange(e.target.checked)}
              disabled={loading}
            />
            <Typography variant='h6'>All Modules</Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Permissions Table */}
          <Paper variant='outlined'>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Modules</TableCell>
                  <TableCell>Sub Modules</TableCell>
                  <TableCell align='center'>Create</TableCell>
                  <TableCell align='center'>Edit</TableCell>
                  <TableCell align='center'>Delete</TableCell>
                  <TableCell align='center'>View</TableCell>
                  <TableCell align='center'>Allow all</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {permissions?.modules?.map((module, index) => {
                  const isAlwaysEnabled = alwaysEnabledModules.includes(module.module)
                  const isDisabled = loading || isAdmin || isAlwaysEnabled

                  return (
                    <TableRow key={module.module}>
                      <TableCell>{module.label}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell align='center'>
                        <Checkbox
                          checked={module.permissions?.create || false}
                          onChange={(e) => handlePermissionChange(index, 'create', e.target.checked)}
                          disabled={isDisabled}
                        />
                      </TableCell>
                      <TableCell align='center'>
                        <Checkbox
                          checked={module.permissions?.update || false}
                          onChange={(e) => handlePermissionChange(index, 'update', e.target.checked)}
                          disabled={isDisabled}
                        />
                      </TableCell>
                      <TableCell align='center'>
                        <Checkbox
                          checked={module.permissions?.delete || false}
                          onChange={(e) => handlePermissionChange(index, 'delete', e.target.checked)}
                          disabled={isDisabled}
                        />
                      </TableCell>
                      <TableCell align='center'>
                        <Checkbox
                          checked={module.permissions?.view || false}
                          onChange={(e) => handlePermissionChange(index, 'view', e.target.checked)}
                          disabled={isDisabled}
                        />
                      </TableCell>
                      <TableCell align='center'>
                        <Checkbox
                          checked={module.permissions?.all || false}
                          onChange={(e) => handleModuleAllChange(index, e.target.checked)}
                          disabled={isDisabled}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Paper>

          {/* Action Buttons */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant='outlined'
              onClick={handleBack}
              disabled={loading}
            >
              Back
            </Button>
            <Button
              variant='contained'
              startIcon={<SaveIcon />}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default ViewPermissions