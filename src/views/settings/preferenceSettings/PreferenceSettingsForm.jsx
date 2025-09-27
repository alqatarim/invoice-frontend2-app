'use client'

import { useEffect } from 'react'
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  MenuItem,
  FormControlLabel,
  Switch
} from '@mui/material'
import { Save, Refresh } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

const preferenceSettingsSchema = yup.object({
  currency: yup.string().required('Currency is required'),
  timezone: yup.string(),
  dateFormat: yup.string().required('Date format is required'),
  timeFormat: yup.string().required('Time format is required'),
  language: yup.string().required('Language is required'),
  numberFormat: yup.string(),
  enableEmailNotifications: yup.boolean(),
  enableSMSNotifications: yup.boolean(),
  enablePushNotifications: yup.boolean()
})

const PreferenceSettingsForm = ({
  preferenceSettings = {},
  currencies = [],
  loading = false,
  updating = false,
  error = null,
  onUpdate,
  onRefresh,
  onLoadCurrencies
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(preferenceSettingsSchema),
    defaultValues: {
      currency: 'USD',
      timezone: 'UTC',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12',
      language: 'English',
      numberFormat: 'US',
      enableEmailNotifications: true,
      enableSMSNotifications: false,
      enablePushNotifications: true
    }
  })

  useEffect(() => {
    if (preferenceSettings) {
      reset({
        currency: preferenceSettings.currency || 'USD',
        timezone: preferenceSettings.timezone || 'UTC',
        dateFormat: preferenceSettings.dateFormat || 'DD/MM/YYYY',
        timeFormat: preferenceSettings.timeFormat || '12',
        language: preferenceSettings.language || 'English',
        numberFormat: preferenceSettings.numberFormat || 'US',
        enableEmailNotifications: preferenceSettings.enableEmailNotifications ?? true,
        enableSMSNotifications: preferenceSettings.enableSMSNotifications ?? false,
        enablePushNotifications: preferenceSettings.enablePushNotifications ?? true
      })
    }
  }, [preferenceSettings, reset])

  useEffect(() => {
    if (currencies.length === 0) {
      onLoadCurrencies?.()
    }
  }, [currencies.length])

  const onSubmit = async (data) => {
    const formData = new FormData()

    Object.keys(data).forEach(key => {
      formData.append(key, data[key])
    })

    await onUpdate(formData)
  }

  if (loading && !preferenceSettings.currency) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Australia/Sydney'
  ]

  const languages = [
    'English',
    'Spanish',
    'French',
    'German',
    'Chinese',
    'Japanese',
    'Arabic',
    'Hindi'
  ]

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Regional Settings */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Regional Settings
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Currency"
                    select
                    {...register('currency')}
                    error={!!errors.currency}
                    helperText={errors.currency?.message}
                  >
                    {currencies.map((currency) => (
                      <MenuItem key={currency.code || currency.name} value={currency.code || currency.name}>
                        {currency.code || currency.name} - {currency.name || currency.symbol}
                      </MenuItem>
                    ))}
                    {currencies.length === 0 && (
                      <MenuItem value="USD">USD - US Dollar</MenuItem>
                    )}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Timezone"
                    select
                    {...register('timezone')}
                    error={!!errors.timezone}
                    helperText={errors.timezone?.message}
                  >
                    {timezones.map((timezone) => (
                      <MenuItem key={timezone} value={timezone}>
                        {timezone}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Language"
                    select
                    {...register('language')}
                    error={!!errors.language}
                    helperText={errors.language?.message}
                  >
                    {languages.map((language) => (
                      <MenuItem key={language} value={language}>
                        {language}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Number Format"
                    select
                    {...register('numberFormat')}
                    error={!!errors.numberFormat}
                    helperText={errors.numberFormat?.message}
                  >
                    <MenuItem value="US">US (1,234.56)</MenuItem>
                    <MenuItem value="EU">European (1.234,56)</MenuItem>
                    <MenuItem value="IN">Indian (1,23,456.78)</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Date & Time Settings */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Date & Time Settings
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Date Format"
                    select
                    {...register('dateFormat')}
                    error={!!errors.dateFormat}
                    helperText={errors.dateFormat?.message}
                  >
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    <MenuItem value="DD-MM-YYYY">DD-MM-YYYY</MenuItem>
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Time Format"
                    select
                    {...register('timeFormat')}
                    error={!!errors.timeFormat}
                    helperText={errors.timeFormat?.message}
                  >
                    <MenuItem value="12">12 Hour (AM/PM)</MenuItem>
                    <MenuItem value="24">24 Hour</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Preferences */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        {...register('enableEmailNotifications')}
                        defaultChecked={watch('enableEmailNotifications')}
                        onChange={(e) => setValue('enableEmailNotifications', e.target.checked)}
                      />
                    }
                    label="Email Notifications"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        {...register('enableSMSNotifications')}
                        defaultChecked={watch('enableSMSNotifications')}
                        onChange={(e) => setValue('enableSMSNotifications', e.target.checked)}
                      />
                    }
                    label="SMS Notifications"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        {...register('enablePushNotifications')}
                        defaultChecked={watch('enablePushNotifications')}
                        onChange={(e) => setValue('enablePushNotifications', e.target.checked)}
                      />
                    }
                    label="Push Notifications"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Actions */}
        <Grid size={{ xs: 12 }}>
          <Box display="flex" gap={2}>
            <Button
              type="submit"
              variant="contained"
              disabled={updating}
              startIcon={updating ? <CircularProgress size={20} /> : <Save />}
            >
              {updating ? 'Updating...' : 'Update Preferences'}
            </Button>
            <Button
              variant="outlined"
              onClick={onRefresh}
              disabled={loading || updating}
              startIcon={<Refresh />}
            >
              Reset
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default PreferenceSettingsForm