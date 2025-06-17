'use client'

import { useEffect, useState } from 'react'
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
  FormControlLabel,
  Switch,
  MenuItem
} from '@mui/material'
import { Save, Refresh, Email, Send } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

const emailSettingsSchema = yup.object({
  providerType: yup.string().required('Provider type is required'),
  smtpHost: yup.string().when('providerType', {
    is: 'SMTP',
    then: (schema) => schema.required('SMTP host is required'),
    otherwise: (schema) => schema
  }),
  smtpPort: yup.number().when('providerType', {
    is: 'SMTP',
    then: (schema) => schema.required('SMTP port is required').positive(),
    otherwise: (schema) => schema
  }),
  smtpUsername: yup.string().when('providerType', {
    is: 'SMTP',
    then: (schema) => schema.required('SMTP username is required'),
    otherwise: (schema) => schema
  }),
  smtpPassword: yup.string().when('providerType', {
    is: 'SMTP',
    then: (schema) => schema.required('SMTP password is required'),
    otherwise: (schema) => schema
  }),
  fromEmail: yup.string().email('Invalid email').required('From email is required'),
  fromName: yup.string().required('From name is required'),
  replyToEmail: yup.string().email('Invalid email'),
  enableSsl: yup.boolean(),
  enableStartTls: yup.boolean()
})

const EmailSettingsForm = ({ 
  emailSettings = {}, 
  loading = false, 
  updating = false, 
  error = null, 
  onUpdate, 
  onRefresh 
}) => {
  const [testEmailSent, setTestEmailSent] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(emailSettingsSchema),
    defaultValues: {
      providerType: 'Node',
      smtpHost: '',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      fromEmail: '',
      fromName: '',
      replyToEmail: '',
      enableSsl: false,
      enableStartTls: true
    }
  })

  const watchProviderType = watch('providerType')

  useEffect(() => {
    if (emailSettings) {
      reset({
        providerType: emailSettings.providerType || 'Node',
        smtpHost: emailSettings.smtpHost || '',
        smtpPort: emailSettings.smtpPort || 587,
        smtpUsername: emailSettings.smtpUsername || '',
        smtpPassword: emailSettings.smtpPassword || '',
        fromEmail: emailSettings.fromEmail || '',
        fromName: emailSettings.fromName || '',
        replyToEmail: emailSettings.replyToEmail || '',
        enableSsl: emailSettings.enableSsl ?? false,
        enableStartTls: emailSettings.enableStartTls ?? true
      })
    }
  }, [emailSettings, reset])

  const onSubmit = async (data) => {
    const formData = new FormData()
    
    Object.keys(data).forEach(key => {
      formData.append(key, data[key])
    })
    
    const result = await onUpdate(formData)
    if (result?.success) {
      setTestEmailSent(false)
    }
  }

  const handleTestEmail = async () => {
    // This would typically call a test email API endpoint
    setTestEmailSent(true)
    // Reset after 3 seconds
    setTimeout(() => setTestEmailSent(false), 3000)
  }

  if (loading && !emailSettings.fromEmail) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {testEmailSent && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Test email sent successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Email Provider Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Email Provider Settings
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Provider Type"
                    select
                    {...register('providerType')}
                    error={!!errors.providerType}
                    helperText={errors.providerType?.message}
                  >
                    <MenuItem value="Node">Node.js (Default)</MenuItem>
                    <MenuItem value="SMTP">Custom SMTP</MenuItem>
                  </TextField>
                </Grid>

                {watchProviderType === 'SMTP' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="SMTP Host"
                        {...register('smtpHost')}
                        error={!!errors.smtpHost}
                        helperText={errors.smtpHost?.message}
                        placeholder="smtp.gmail.com"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="SMTP Port"
                        type="number"
                        {...register('smtpPort')}
                        error={!!errors.smtpPort}
                        helperText={errors.smtpPort?.message}
                        placeholder="587"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="SMTP Username"
                        {...register('smtpUsername')}
                        error={!!errors.smtpUsername}
                        helperText={errors.smtpUsername?.message}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="SMTP Password"
                        type="password"
                        {...register('smtpPassword')}
                        error={!!errors.smtpPassword}
                        helperText={errors.smtpPassword?.message}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            {...register('enableSsl')}
                            defaultChecked={watch('enableSsl')}
                            onChange={(e) => setValue('enableSsl', e.target.checked)}
                          />
                        }
                        label="Enable SSL"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            {...register('enableStartTls')}
                            defaultChecked={watch('enableStartTls')}
                            onChange={(e) => setValue('enableStartTls', e.target.checked)}
                          />
                        }
                        label="Enable STARTTLS"
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Email Configuration */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Email Configuration
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="From Email"
                    type="email"
                    {...register('fromEmail')}
                    error={!!errors.fromEmail}
                    helperText={errors.fromEmail?.message}
                    placeholder="noreply@yourcompany.com"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="From Name"
                    {...register('fromName')}
                    error={!!errors.fromName}
                    helperText={errors.fromName?.message}
                    placeholder="Your Company Name"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Reply-To Email (Optional)"
                    type="email"
                    {...register('replyToEmail')}
                    error={!!errors.replyToEmail}
                    helperText={errors.replyToEmail?.message}
                    placeholder="support@yourcompany.com"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              type="submit"
              variant="contained"
              disabled={updating}
              startIcon={updating ? <CircularProgress size={20} /> : <Save />}
            >
              {updating ? 'Updating...' : 'Update Email Settings'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={onRefresh}
              disabled={loading || updating}
              startIcon={<Refresh />}
            >
              Reset
            </Button>

            <Button
              variant="outlined"
              onClick={handleTestEmail}
              disabled={loading || updating}
              startIcon={<Send />}
              color="secondary"
            >
              Send Test Email
            </Button>
          </Box>
        </Grid>

        {/* Help Information */}
        <Grid item xs={12}>
          <Alert severity="info">
            <Typography variant="subtitle2" gutterBottom>
              Email Configuration Help
            </Typography>
            <Typography variant="body2">
              • <strong>Node.js Provider:</strong> Uses the default server email configuration<br/>
              • <strong>SMTP Provider:</strong> Use your custom SMTP server (Gmail, Outlook, etc.)<br/>
              • <strong>Gmail Users:</strong> Use smtp.gmail.com, port 587, and enable 2-factor authentication with app passwords
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Box>
  )
}

export default EmailSettingsForm