'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material'
import { Icon } from '@iconify/react'

const RoleDialog = ({ open, onClose, data, onSubmit, loading }) => {
  const [roleName, setRoleName] = useState('')
  const [error, setError] = useState('')

  // Update form when data changes
  useEffect(() => {
    if (data) {
      setRoleName(data.roleName || '')
    } else {
      setRoleName('')
    }
    setError('')
  }, [data, open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const trimmedName = roleName.trim()
    if (!trimmedName) {
      setError('Role name is required')
      return
    }

    const formData = new FormData()
    if (data?._id) {
      formData.append('_id', data._id)
    }
    formData.append('roleName', trimmedName)

    const success = await onSubmit(formData)
    if (success) {
      handleClose()
    }
  }

  const handleClose = () => {
    setRoleName('')
    setError('')
    onClose()
  }

  const isEdit = !!data?._id

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px'
        }
      }}
    >
      <DialogTitle className="flex items-center justify-between p-6">
        <div>
          <Typography variant="h5" className="font-semibold">
            {isEdit ? 'Edit Role' : 'Add New Role'}
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mt-1">
            {isEdit ? 'Update the role name' : 'Enter a name for the new role'}
          </Typography>
        </div>
        <IconButton onClick={handleClose} disabled={loading}>
          <Icon icon="mdi:close" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent className="px-6 pb-2">
          <TextField
            label="Role Name"
            value={roleName}
            onChange={(e) => {
              setRoleName(e.target.value)
              if (error) setError('')
            }}
            error={!!error}
            helperText={error}
            disabled={loading}
            autoFocus
            fullWidth
            placeholder="Enter role name"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              }
            }}
          />
        </DialogContent>

        <DialogActions className="flex gap-3 p-6 pt-4">
          <Button
            onClick={handleClose}
            disabled={loading}
            variant="outlined"
            sx={{ borderRadius: '12px' }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !roleName.trim()}
            variant="contained"
            startIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Icon icon={isEdit ? "mdi:check" : "mdi:plus"} />
              )
            }
            sx={{ borderRadius: '12px' }}
          >
            {loading 
              ? (isEdit ? 'Updating...' : 'Adding...') 
              : (isEdit ? 'Update Role' : 'Add Role')
            }
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default RoleDialog
