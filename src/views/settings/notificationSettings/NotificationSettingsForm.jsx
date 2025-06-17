'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  Alert,
  Box,
  CircularProgress
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { toast } from 'react-toastify'

const notificationSchema = yup.object().shape({
  senderId: yup.string().required('Firebase Sender ID is required'),
  serverKey: yup.string().required('Firebase Server Key is required'),
})

const NotificationSettingsForm = ({
  notificationSettings,
  loading,
  updating,
  error,
  onUpdate,
  onRefresh
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(notificationSchema),
    defaultValues: {
      senderId: '',
      serverKey: ''
    }
  })

  useEffect(() => {
    if (notificationSettings) {
      setValue('senderId', notificationSettings.senderId || '')
      setValue('serverKey', notificationSettings.serverKey || '')
    }
  }, [notificationSettings, setValue])

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('senderId', data.senderId)
      formData.append('serverKey', data.serverKey)

      const result = await onUpdate(formData)
      if (result?.success) {
        toast.success('Notification settings updated successfully!')
      } else {
        toast.error(result?.message || 'Failed to update notification settings')
      }
    } catch (error) {
      toast.error('An error occurred while updating notification settings')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    reset()
    if (notificationSettings) {
      setValue('senderId', notificationSettings.senderId || '')
      setValue('serverKey', notificationSettings.serverKey || '')
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Card>
      <CardContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="senderId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Firebase Sender ID"
                    placeholder="Enter the Sender ID"
                    error={!!errors.senderId}
                    helperText={errors.senderId?.message}
                    required
                    disabled={updating || isSubmitting}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="serverKey"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Firebase Server Key"
                    placeholder="Enter Server Key"
                    error={!!errors.serverKey}
                    helperText={errors.serverKey?.message}
                    required
                    disabled={updating || isSubmitting}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={updating || isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={updating || isSubmitting}
                  startIcon={
                    (updating || isSubmitting) && (
                      <CircularProgress size={20} color="inherit" />
                    )
                  }
                >
                  {updating || isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default NotificationSettingsForm