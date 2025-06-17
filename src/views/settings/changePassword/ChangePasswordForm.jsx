'use client'

import { useState } from 'react'
import { 
  Box, 
  Grid, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Card,
  CardContent
} from '@mui/material'
import { Visibility, VisibilityOff, Lock } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

const changePasswordSchema = yup.object({
  oldPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password')
})

const ChangePasswordForm = ({ 
  loading = false, 
  updating = false, 
  error = null, 
  onChangePassword 
}) => {
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  })
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const onSubmit = async (data) => {
    setSuccess(false)
    const formData = new FormData()
    formData.append('oldPassword', data.oldPassword)
    formData.append('newPassword', data.newPassword)
    
    const result = await onChangePassword(formData)
    if (result?.success) {
      setSuccess(true)
      reset()
      setShowPasswords({ old: false, new: false, confirm: false })
    }
  }

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto' }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Lock color="primary" />
          <Typography variant="h6">
            Change Your Password
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" mb={3}>
          Please enter your current password and choose a new secure password.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Password changed successfully!
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Password"
                type={showPasswords.old ? 'text' : 'password'}
                {...register('oldPassword')}
                error={!!errors.oldPassword}
                helperText={errors.oldPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('old')}
                        edge="end"
                      >
                        {showPasswords.old ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Password"
                type={showPasswords.new ? 'text' : 'password'}
                {...register('newPassword')}
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message || 'Password must be at least 8 characters long'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('new')}
                        edge="end"
                      >
                        {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showPasswords.confirm ? 'text' : 'password'}
                {...register('confirmPassword')}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('confirm')}
                        edge="end"
                      >
                        {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={updating}
                  startIcon={updating && <CircularProgress size={20} />}
                >
                  {updating ? 'Changing Password...' : 'Change Password'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    reset()
                    setSuccess(false)
                  }}
                  disabled={updating}
                >
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Password Requirements */}
        <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
          <Typography variant="subtitle2" gutterBottom>
            Password Requirements:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ m: 0, pl: 2 }}>
            <li>At least 8 characters long</li>
            <li>Include both uppercase and lowercase letters</li>
            <li>Include at least one number</li>
            <li>Include at least one special character</li>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default ChangePasswordForm