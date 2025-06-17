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
import {
  PhotoCamera,
  Business,
  Save,
  Refresh
} from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

const companySettingsSchema = yup.object({
  companyName: yup.string().required('Company name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  addressLine1: yup.string().required('Address Line 1 is required'),
  addressLine2: yup.string(),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  country: yup.string().required('Country is required'),
  pincode: yup.string().required('Pincode is required')
})

const CompanySettingsForm = ({
  companySettings = {},
  loading = false,
  updating = false,
  error = null,
  onUpdate,
  onRefresh
}) => {
  const [logoPreview, setLogoPreview] = useState(null)
  const [faviconPreview, setFaviconPreview] = useState(null)
  const [companyIconPreview, setCompanyIconPreview] = useState(null)
  const [selectedLogo, setSelectedLogo] = useState(null)
  const [selectedFavicon, setSelectedFavicon] = useState(null)
  const [selectedCompanyIcon, setSelectedCompanyIcon] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(companySettingsSchema),
    defaultValues: {
      companyName: '',
      email: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
      pincode: ''
    }
  })

  useEffect(() => {
    if (companySettings) {
      reset({
        companyName: companySettings.companyName || '',
        email: companySettings.email || '',
        phone: companySettings.phone || '',
        addressLine1: companySettings.addressLine1 || '',
        addressLine2: companySettings.addressLine2 || '',
        city: companySettings.city || '',
        state: companySettings.state || '',
        country: companySettings.country || '',
        pincode: companySettings.pincode || ''
      })

      if (companySettings.siteLogo) {
        setLogoPreview(companySettings.siteLogo)
      }
      if (companySettings.favicon) {
        setFaviconPreview(companySettings.favicon)
      }
      if (companySettings.companyLogo) {
        setCompanyIconPreview(companySettings.companyLogo)
      }
    }
  }, [companySettings, reset])

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

  const handleFaviconChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFavicon(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFaviconPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCompanyIconChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedCompanyIcon(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCompanyIconPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data) => {
    const formData = new FormData()

    // Add form fields
    Object.keys(data).forEach(key => {
      if (data[key]) {
        formData.append(key, data[key])
      }
    })

    // Add images if selected
    if (selectedLogo) {
      formData.append('siteLogo', selectedLogo)
    }
    if (selectedFavicon) {
      formData.append('faviconLogo', selectedFavicon)
    }
    if (selectedCompanyIcon) {
      formData.append('companyLogo', selectedCompanyIcon)
    }

    const result = await onUpdate(formData)
    if (result?.success) {
      // Reset file selections
      setSelectedLogo(null)
      setSelectedFavicon(null)
      setSelectedCompanyIcon(null)
    }
  }

  if (loading && !companySettings.companyName) {
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
          <Grid container spacing={6}>
            {/* Company Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Company Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Name"
                {...register('companyName')}
                error={!!errors.companyName}
                helperText={errors.companyName?.message}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Email"
                type="email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                {...register('phone')}
                error={!!errors.phone}
                helperText={errors.phone?.message}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address Line 1"
                {...register('addressLine1')}
                error={!!errors.addressLine1}
                helperText={errors.addressLine1?.message}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address Line 2"
                {...register('addressLine2')}
                error={!!errors.addressLine2}
                helperText={errors.addressLine2?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                {...register('city')}
                error={!!errors.city}
                helperText={errors.city?.message}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                {...register('state')}
                error={!!errors.state}
                helperText={errors.state?.message}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                {...register('country')}
                error={!!errors.country}
                helperText={errors.country?.message}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Pincode"
                {...register('pincode')}
                error={!!errors.pincode}
                helperText={errors.pincode?.message}
                required
              />
            </Grid>

            {/* Logo and Favicon Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Company Branding
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Site Logo
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    JPEG, PNG, JPG (Max 800*400px)
                  </Typography>
                  <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <Avatar
                      src={logoPreview}
                      sx={{ width: 120, height: 120 }}
                      variant="rounded"
                    >
                      <Business sx={{ fontSize: 60 }} />
                    </Avatar>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="site-logo-upload"
                      type="file"
                      onChange={handleLogoChange}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        component="label"
                        htmlFor="site-logo-upload"
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
                          Remove
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Favicon
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    JPEG, PNG, JPG (Max 35*35px)
                  </Typography>
                  <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <Avatar
                      src={faviconPreview}
                      sx={{ width: 60, height: 60 }}
                      variant="rounded"
                    >
                      <Business sx={{ fontSize: 30 }} />
                    </Avatar>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="favicon-upload"
                      type="file"
                      onChange={handleFaviconChange}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        component="label"
                        htmlFor="favicon-upload"
                        startIcon={<PhotoCamera />}
                        size="small"
                      >
                        Choose File
                      </Button>
                      {faviconPreview && (
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setFaviconPreview(null)
                            setSelectedFavicon(null)
                          }}
                          size="small"
                        >
                          Remove
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Company Icon
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    SVG, PNG, JPG (Max 100*100px)
                  </Typography>
                  <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <Avatar
                      src={companyIconPreview}
                      sx={{ width: 80, height: 80 }}
                      variant="rounded"
                    >
                      <Business sx={{ fontSize: 40 }} />
                    </Avatar>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="company-icon-upload"
                      type="file"
                      onChange={handleCompanyIconChange}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        component="label"
                        htmlFor="company-icon-upload"
                        startIcon={<PhotoCamera />}
                        size="small"
                      >
                        Choose File
                      </Button>
                      {companyIconPreview && (
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setCompanyIconPreview(null)
                            setSelectedCompanyIcon(null)
                          }}
                          size="small"
                        >
                          Remove
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={onRefresh}
                  startIcon={<Refresh />}
                  disabled={loading || updating}
                >
                  Reset
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

export default CompanySettingsForm