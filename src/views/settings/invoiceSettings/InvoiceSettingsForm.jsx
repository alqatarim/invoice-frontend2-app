'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Avatar,
  Card,
  CardContent
} from '@mui/material'
import { PhotoCamera, Receipt, Save, Refresh } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

const invoiceSettingsSchema = yup.object({
  invoicePrefix: yup.string().required('Invoice prefix is required')
})

const InvoiceSettingsForm = ({
  invoiceSettings = {},
  loading = false,
  updating = false,
  error = null,
  onUpdate,
  onRefresh
}) => {
  const [logoPreview, setLogoPreview] = useState(null)
  const [selectedLogo, setSelectedLogo] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(invoiceSettingsSchema),
    defaultValues: {
      invoicePrefix: ''
    }
  })

  useEffect(() => {
    if (invoiceSettings) {
      reset({
        invoicePrefix: invoiceSettings.invoicePrefix || ''
      })

      if (invoiceSettings.invoiceLogo) {
        setLogoPreview(invoiceSettings.invoiceLogo)
      }
    }
  }, [invoiceSettings, reset])

  const handleLogoChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedLogo(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data) => {
    const formData = new FormData()

    // Add form fields
    Object.keys(data).forEach(key => {
      formData.append(key, data[key])
    })

    // Add logo if selected
    if (selectedLogo) {
      formData.append('invoiceLogo', selectedLogo)
    }

    const result = await onUpdate(formData)
    if (result?.success) {
      // Reset file selection
      setSelectedLogo(null)
    }
  }

  if (loading && !invoiceSettings.invoicePrefix) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
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

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Invoice Configuration */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                Invoice Configuration
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Invoice Prefix"
                {...register('invoicePrefix')}
                error={!!errors.invoicePrefix}
                helperText={errors.invoicePrefix?.message || 'e.g., INV-, BILL-'}
                required
              />
            </Grid>

            {/* Invoice Logo */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Invoice Logo
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Invoice Logo
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    SVG, PNG, JPG
                  </Typography>
                  <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <Avatar
                      src={logoPreview}
                      sx={{ width: 120, height: 120 }}
                      variant="rounded"
                    >
                      <Receipt sx={{ fontSize: 60 }} />
                    </Avatar>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="invoice-logo-upload"
                      type="file"
                      onChange={handleLogoChange}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        component="label"
                        htmlFor="invoice-logo-upload"
                        startIcon={<PhotoCamera />}
                        size="small"
                      >
                        Choose File
                      </Button>
                      {logoPreview && (
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setLogoPreview(null)
                            setSelectedLogo(null)
                          }}
                          size="small"
                        >
                          Remove Logo
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Action Buttons */}
            <Grid size={{ xs: 12 }}>
              <Box display="flex" gap={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={onRefresh}
                  startIcon={<Refresh />}
                  disabled={loading || updating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={updating}
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  )
}

export default InvoiceSettingsForm