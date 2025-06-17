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
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import { Save, Refresh, ExpandMore, Payment } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

const paymentSettingsSchema = yup.object({
  // Stripe Settings
  enableStripe: yup.boolean(),
  stripePublishableKey: yup.string().when('enableStripe', {
    is: true,
    then: (schema) => schema.required('Stripe publishable key is required'),
    otherwise: (schema) => schema
  }),
  stripeSecretKey: yup.string().when('enableStripe', {
    is: true,
    then: (schema) => schema.required('Stripe secret key is required'),
    otherwise: (schema) => schema
  }),
  stripeWebhookSecret: yup.string(),
  stripeTestMode: yup.boolean(),
  
  // PayPal Settings
  enablePaypal: yup.boolean(),
  paypalClientId: yup.string().when('enablePaypal', {
    is: true,
    then: (schema) => schema.required('PayPal client ID is required'),
    otherwise: (schema) => schema
  }),
  paypalClientSecret: yup.string().when('enablePaypal', {
    is: true,
    then: (schema) => schema.required('PayPal client secret is required'),
    otherwise: (schema) => schema
  }),
  paypalSandboxMode: yup.boolean(),
  
  // General Settings
  defaultPaymentMethod: yup.string(),
  paymentTerms: yup.string(),
  lateFeePercent: yup.number().min(0).max(100),
  enableLateFees: yup.boolean()
})

const PaymentSettingsForm = ({ 
  paymentSettings = {}, 
  loading = false, 
  updating = false, 
  error = null, 
  onUpdate, 
  onRefresh 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(paymentSettingsSchema),
    defaultValues: {
      enableStripe: false,
      stripePublishableKey: '',
      stripeSecretKey: '',
      stripeWebhookSecret: '',
      stripeTestMode: true,
      enablePaypal: false,
      paypalClientId: '',
      paypalClientSecret: '',
      paypalSandboxMode: true,
      defaultPaymentMethod: 'cash',
      paymentTerms: 'Net 30',
      lateFeePercent: 1.5,
      enableLateFees: false
    }
  })

  const watchEnableStripe = watch('enableStripe')
  const watchEnablePaypal = watch('enablePaypal')
  const watchEnableLateFees = watch('enableLateFees')

  useEffect(() => {
    if (paymentSettings) {
      reset({
        enableStripe: paymentSettings.enableStripe ?? false,
        stripePublishableKey: paymentSettings.stripePublishableKey || '',
        stripeSecretKey: paymentSettings.stripeSecretKey || '',
        stripeWebhookSecret: paymentSettings.stripeWebhookSecret || '',
        stripeTestMode: paymentSettings.stripeTestMode ?? true,
        enablePaypal: paymentSettings.enablePaypal ?? false,
        paypalClientId: paymentSettings.paypalClientId || '',
        paypalClientSecret: paymentSettings.paypalClientSecret || '',
        paypalSandboxMode: paymentSettings.paypalSandboxMode ?? true,
        defaultPaymentMethod: paymentSettings.defaultPaymentMethod || 'cash',
        paymentTerms: paymentSettings.paymentTerms || 'Net 30',
        lateFeePercent: paymentSettings.lateFeePercent || 1.5,
        enableLateFees: paymentSettings.enableLateFees ?? false
      })
    }
  }, [paymentSettings, reset])

  const onSubmit = async (data) => {
    const formData = new FormData()
    
    Object.keys(data).forEach(key => {
      formData.append(key, data[key])
    })
    
    await onUpdate(formData)
  }

  if (loading && !paymentSettings.defaultPaymentMethod) {
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

      <Grid container spacing={3}>
        {/* General Payment Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                General Payment Settings
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Default Payment Method"
                    select
                    SelectProps={{ native: true }}
                    {...register('defaultPaymentMethod')}
                    error={!!errors.defaultPaymentMethod}
                    helperText={errors.defaultPaymentMethod?.message}
                  >
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="stripe">Stripe</option>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Payment Terms"
                    select
                    SelectProps={{ native: true }}
                    {...register('paymentTerms')}
                    error={!!errors.paymentTerms}
                    helperText={errors.paymentTerms?.message}
                  >
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 45">Net 45</option>
                    <option value="Net 60">Net 60</option>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        {...register('enableLateFees')}
                        defaultChecked={watchEnableLateFees}
                        onChange={(e) => setValue('enableLateFees', e.target.checked)}
                      />
                    }
                    label="Enable Late Fees"
                  />
                </Grid>

                {watchEnableLateFees && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Late Fee Percentage (%)"
                      type="number"
                      inputProps={{ min: 0, max: 100, step: 0.1 }}
                      {...register('lateFeePercent')}
                      error={!!errors.lateFeePercent}
                      helperText={errors.lateFeePercent?.message}
                    />
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Stripe Settings */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box display="flex" alignItems="center" gap={2}>
                <Payment />
                <Typography variant="h6">Stripe Settings</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      {...register('enableStripe')}
                      defaultChecked={watchEnableStripe}
                      onChange={(e) => {
                        e.stopPropagation()
                        setValue('enableStripe', e.target.checked)
                      }}
                    />
                  }
                  label="Enable Stripe"
                  onClick={(e) => e.stopPropagation()}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Publishable Key"
                    {...register('stripePublishableKey')}
                    error={!!errors.stripePublishableKey}
                    helperText={errors.stripePublishableKey?.message}
                    disabled={!watchEnableStripe}
                    placeholder="pk_..."
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Secret Key"
                    type="password"
                    {...register('stripeSecretKey')}
                    error={!!errors.stripeSecretKey}
                    helperText={errors.stripeSecretKey?.message}
                    disabled={!watchEnableStripe}
                    placeholder="sk_..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Webhook Secret (Optional)"
                    {...register('stripeWebhookSecret')}
                    error={!!errors.stripeWebhookSecret}
                    helperText={errors.stripeWebhookSecret?.message}
                    disabled={!watchEnableStripe}
                    placeholder="whsec_..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        {...register('stripeTestMode')}
                        defaultChecked={watch('stripeTestMode')}
                        onChange={(e) => setValue('stripeTestMode', e.target.checked)}
                        disabled={!watchEnableStripe}
                      />
                    }
                    label="Test Mode (Use test keys)"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* PayPal Settings */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box display="flex" alignItems="center" gap={2}>
                <Payment />
                <Typography variant="h6">PayPal Settings</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      {...register('enablePaypal')}
                      defaultChecked={watchEnablePaypal}
                      onChange={(e) => {
                        e.stopPropagation()
                        setValue('enablePaypal', e.target.checked)
                      }}
                    />
                  }
                  label="Enable PayPal"
                  onClick={(e) => e.stopPropagation()}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Client ID"
                    {...register('paypalClientId')}
                    error={!!errors.paypalClientId}
                    helperText={errors.paypalClientId?.message}
                    disabled={!watchEnablePaypal}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Client Secret"
                    type="password"
                    {...register('paypalClientSecret')}
                    error={!!errors.paypalClientSecret}
                    helperText={errors.paypalClientSecret?.message}
                    disabled={!watchEnablePaypal}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        {...register('paypalSandboxMode')}
                        defaultChecked={watch('paypalSandboxMode')}
                        onChange={(e) => setValue('paypalSandboxMode', e.target.checked)}
                        disabled={!watchEnablePaypal}
                      />
                    }
                    label="Sandbox Mode (Use test environment)"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Box display="flex" gap={2}>
            <Button
              type="submit"
              variant="contained"
              disabled={updating}
              startIcon={updating ? <CircularProgress size={20} /> : <Save />}
            >
              {updating ? 'Updating...' : 'Update Payment Settings'}
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

export default PaymentSettingsForm