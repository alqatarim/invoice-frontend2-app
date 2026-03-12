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
  CardContent,
  Divider,
  FormControlLabel,
  Switch
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
import { Autocomplete, GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api'
import CustomAvatar from '@core/components/mui/Avatar'
import { useTheme } from "@mui/material/styles";
const DEFAULT_MAP_CENTER = { lat: 24.7136, lng: 46.6753 }
const GOOGLE_MAP_LIBRARIES = ['places']
const GOOGLE_PLACES_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyClYD8Rg81sa6Hl1xUOFv5tTO0cg9bz8Vs'

const STORE_HOUR_DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
]

const createDefaultStoreHours = () =>
  STORE_HOUR_DAYS.reduce((acc, day) => {
    acc[day.key] = {
      open: '09:00',
      close: '18:00',
      isClosed: false
    }
    return acc
  }, {})

const normalizeStoreHours = (storeHours = {}) =>
  STORE_HOUR_DAYS.reduce((acc, day) => {
    const source = storeHours?.[day.key] || {}
    acc[day.key] = {
      open: typeof source.open === 'string' && source.open ? source.open : '09:00',
      close: typeof source.close === 'string' && source.close ? source.close : '18:00',
      isClosed: Boolean(source.isClosed)
    }
    return acc
  }, {})

const companySettingsSchema = yup.object({
  companyName: yup.string().required('Enter Company Name'),
  email: yup
    .string()
    .email('Email must be a valid email')
    .required('Enter Company Email'),
  phone: yup
    .string()
    .required('Enter Phone number')
    .min(10, 'Phone Number Must Be At Least 10 Digits')
    .max(10, 'Phone Number Must Be At Most 10 Digits')
    .matches(/^\+?[1-9]\d*$/, 'Invalid phone number'),
  addressLine1: yup
    .string()
    .required('Enter Address Line 1')
    .min(4, 'Address Line 1 Must Be At Least 6 Characters')
    .max(30, 'Address Line 1 Must Be At Most 30 Characters'),
  addressLine2: yup.string(),
  city: yup.string().required('Enter City Name'),
  state: yup.string().required('Enter State Name'),
  country: yup.string().required('Enter Country Name'),
  pincode: yup.string(),
  googleLocationAddress: yup.string().nullable(),
  googleLocationPlaceId: yup.string().nullable(),
  googleLocationLat: yup.string().nullable(),
  googleLocationLng: yup.string().nullable()
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
  const [storeHours, setStoreHours] = useState(createDefaultStoreHours())
  const [mapCenter, setMapCenter] = useState(DEFAULT_MAP_CENTER)
  const [selectedLocation, setSelectedLocation] = useState({
    placeId: '',
    formattedAddress: '',
    latitude: null,
    longitude: null
  })
  const [autocompleteInstance, setAutocompleteInstance] = useState(null)

  const theme = useTheme()

  const {
    isLoaded: isGoogleMapsLoaded,
    loadError: googleMapsLoadError
  } = useJsApiLoader({
    id: 'company-settings-google-map-script',
    googleMapsApiKey: GOOGLE_PLACES_API_KEY,
    libraries: GOOGLE_MAP_LIBRARIES
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
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
      pincode: '',
      googleLocationAddress: '',
      googleLocationPlaceId: '',
      googleLocationLat: '',
      googleLocationLng: ''
    }
  })


  const resolvedCompanySettings =
    companySettings?.updatedData && typeof companySettings.updatedData === 'object'
      ? companySettings.updatedData
      : companySettings || {}

  const alwaysShrinkLabel = { shrink: true }
  const selectedAddress = watch('googleLocationAddress')

  const applySelectedLocation = (location = {}, options = {}) => {
    const shouldMarkDirty = options.markDirty ?? true
    const lat = Number(location.latitude)
    const lng = Number(location.longitude)
    const hasValidCoordinates = Number.isFinite(lat) && Number.isFinite(lng)

    const normalizedLocation = {
      placeId: location.placeId || '',
      formattedAddress: location.formattedAddress || '',
      latitude: hasValidCoordinates ? lat : null,
      longitude: hasValidCoordinates ? lng : null
    }

    setSelectedLocation(normalizedLocation)
    setValue('googleLocationAddress', normalizedLocation.formattedAddress, { shouldDirty: shouldMarkDirty })
    setValue('googleLocationPlaceId', normalizedLocation.placeId, { shouldDirty: shouldMarkDirty })
    setValue('googleLocationLat', hasValidCoordinates ? String(normalizedLocation.latitude) : '', {
      shouldDirty: shouldMarkDirty
    })
    setValue('googleLocationLng', hasValidCoordinates ? String(normalizedLocation.longitude) : '', {
      shouldDirty: shouldMarkDirty
    })

    if (hasValidCoordinates) {
      setMapCenter({ lat, lng })
    }
  }

  useEffect(() => {
    if (resolvedCompanySettings) {
      const googleLocation = resolvedCompanySettings?.googleLocation || {
        placeId: resolvedCompanySettings?.googleLocationPlaceId || '',
        formattedAddress: resolvedCompanySettings?.googleLocationAddress || '',
        latitude: resolvedCompanySettings?.googleLocationLat ?? null,
        longitude: resolvedCompanySettings?.googleLocationLng ?? null
      }
      const normalizedStoreHours = normalizeStoreHours(resolvedCompanySettings?.storeHours || {})

      reset({
        companyName: resolvedCompanySettings.companyName || '',
        email: resolvedCompanySettings.email || '',
        phone: resolvedCompanySettings.phone || '',
        addressLine1: resolvedCompanySettings.addressLine1 || '',
        addressLine2: resolvedCompanySettings.addressLine2 || '',
        city: resolvedCompanySettings.city || '',
        state: resolvedCompanySettings.state || '',
        country: resolvedCompanySettings.country || '',
        pincode: resolvedCompanySettings.pincode || '',
        googleLocationAddress: googleLocation.formattedAddress || '',
        googleLocationPlaceId: googleLocation.placeId || '',
        googleLocationLat:
          googleLocation?.latitude !== null &&
            googleLocation?.latitude !== undefined
            ? String(googleLocation.latitude)
            : '',
        googleLocationLng:
          googleLocation?.longitude !== null &&
            googleLocation?.longitude !== undefined
            ? String(googleLocation.longitude)
            : ''
      })

      applySelectedLocation(
        {
          placeId: googleLocation?.placeId || '',
          formattedAddress: googleLocation?.formattedAddress || '',
          latitude: googleLocation?.latitude,
          longitude: googleLocation?.longitude
        },
        { markDirty: false }
      )
      setStoreHours(normalizedStoreHours)

      if (resolvedCompanySettings.siteLogo) {
        setLogoPreview(resolvedCompanySettings.siteLogo)
      }
      if (resolvedCompanySettings.favicon) {
        setFaviconPreview(resolvedCompanySettings.favicon)
      }
      if (resolvedCompanySettings.companyLogo) {
        setCompanyIconPreview(resolvedCompanySettings.companyLogo)
      }
    }
  }, [resolvedCompanySettings, reset])

  const handleAutocompleteLoad = (autocomplete) => {
    setAutocompleteInstance(autocomplete)
  }

  const handlePlaceChanged = () => {
    if (!autocompleteInstance) {
      return
    }

    const place = autocompleteInstance.getPlace()
    const latitude = place?.geometry?.location?.lat?.()
    const longitude = place?.geometry?.location?.lng?.()

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return
    }

    applySelectedLocation({
      placeId: place?.place_id || '',
      formattedAddress: place?.formatted_address || place?.name || '',
      latitude,
      longitude
    })
  }

  const handleMapClick = (event) => {
    const latitude = event?.latLng?.lat?.()
    const longitude = event?.latLng?.lng?.()

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return
    }

    if (window.google?.maps?.Geocoder) {
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
        const firstResult = status === 'OK' && Array.isArray(results) ? results[0] : null

        applySelectedLocation({
          placeId: firstResult?.place_id || '',
          formattedAddress:
            firstResult?.formatted_address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          latitude,
          longitude
        })
      })

      return
    }

    applySelectedLocation({
      placeId: '',
      formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      latitude,
      longitude
    })
  }

  const handleClearLocation = () => {
    applySelectedLocation(
      {
        placeId: '',
        formattedAddress: '',
        latitude: null,
        longitude: null
      },
      { markDirty: true }
    )
    setMapCenter(DEFAULT_MAP_CENTER)
  }

  const handleStoreHourChange = (dayKey, field, value) => {
    setStoreHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [field]: value
      }
    }))
  }

  const handleStoreDayOpenToggle = (dayKey, isOpen) => {
    setStoreHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        isClosed: !isOpen
      }
    }))
  }

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
    const locationKeys = [
      'googleLocationAddress',
      'googleLocationPlaceId',
      'googleLocationLat',
      'googleLocationLng'
    ]

    // Add form fields
    Object.keys(data).forEach(key => {
      if (locationKeys.includes(key)) {
        return
      }

      if (data[key]) {
        formData.append(key, data[key])
      }
    })

    locationKeys.forEach(key => {
      formData.append(key, data[key] ?? '')
    })
    formData.append('storeHours', JSON.stringify(storeHours))

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

  if (loading && !resolvedCompanySettings.companyName) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Card>


      <CardContent sx={{ pt: 5 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register('googleLocationAddress')} />
          <input type="hidden" {...register('googleLocationPlaceId')} />
          <input type="hidden" {...register('googleLocationLat')} />
          <input type="hidden" {...register('googleLocationLng')} />

          <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>

              <Box sx={{ py: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <CustomAvatar variant='rounded' skin='light' color='primary' size={36}>
                  <i className='ri-building-line' />
                </CustomAvatar>
                <Box>
                  <Typography variant='h6' sx={{ fontWeight: 600 }}>
                    Information
                  </Typography>
                </Box>
              </Box>

              <CardContent>
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label='Company Name'
                      {...register('companyName')}
                      InputLabelProps={alwaysShrinkLabel}
                      error={!!errors.companyName}
                      helperText={errors.companyName?.message}
                      required
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label='Company Email'
                      type='email'
                      {...register('email')}
                      InputLabelProps={alwaysShrinkLabel}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      required
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label='Phone'
                      {...register('phone')}
                      InputLabelProps={alwaysShrinkLabel}
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      required
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label='Address Line 1'
                      {...register('addressLine1')}
                      InputLabelProps={alwaysShrinkLabel}
                      error={!!errors.addressLine1}
                      helperText={errors.addressLine1?.message}
                      required
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label='Address Line 2'
                      {...register('addressLine2')}
                      InputLabelProps={alwaysShrinkLabel}
                      error={!!errors.addressLine2}
                      helperText={errors.addressLine2?.message}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label='City'
                      {...register('city')}
                      InputLabelProps={alwaysShrinkLabel}
                      error={!!errors.city}
                      helperText={errors.city?.message}
                      required
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label='State'
                      {...register('state')}
                      InputLabelProps={alwaysShrinkLabel}
                      error={!!errors.state}
                      helperText={errors.state?.message}
                      required
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label='Country'
                      {...register('country')}
                      InputLabelProps={alwaysShrinkLabel}
                      error={!!errors.country}
                      helperText={errors.country?.message}
                      required
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label='Pincode'
                      {...register('pincode')}
                      InputLabelProps={alwaysShrinkLabel}
                      error={!!errors.pincode}
                      helperText={errors.pincode?.message}
                      required
                    />
                  </Grid>
                </Grid>
              </CardContent>

            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{ py: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <CustomAvatar variant='rounded' skin='light' color='info' size={36}>
                  <i className='ri-time-line' />
                </CustomAvatar>
                <Box>
                  <Typography variant='h6' sx={{ fontWeight: 600 }}>
                    Store Hours
                  </Typography>
                </Box>
              </Box>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    maxWidth: 700,
                    // mx: 'auto'
                  }}
                >
                  {STORE_HOUR_DAYS.map(day => {
                    const dayHours = storeHours?.[day.key] || {
                      open: '00:00',
                      close: '00:00',
                      isClosed: false
                    }
                    const isOpen = !dayHours.isClosed

                    return (
                      <Box
                        key={day.key}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          p: 2,
                          borderRadius: 1,
                          borderColor: theme.palette.secondary.lightestOpacity,
                          borderWidth: 1,
                          backgroundColor: theme.palette.secondary.lightestOpacity,
                        }}

                      >
                        <Box sx={{ width: 120, flexShrink: 0 }}>
                          <Typography variant='body1'>{day.label}</Typography>
                        </Box>



                        {isOpen && (
                          <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                            <TextField
                              size='small'
                              fullWidth
                              type='time'
                              value={dayHours.open}
                              onChange={(event) =>
                                handleStoreHourChange(day.key, 'open', event.target.value)
                              }
                              inputProps={{ step: 300, style: { padding: '8.5px 14px' } }}
                            />
                            <Typography sx={{ alignSelf: 'center', color: 'text.disabled' }}>-</Typography>
                            <TextField
                              size='small'
                              fullWidth
                              type='time'
                              value={dayHours.close}
                              onChange={(event) =>
                                handleStoreHourChange(day.key, 'close', event.target.value)
                              }
                              inputProps={{ step: 300, style: { padding: '8.5px 14px' } }}
                            />
                          </Box>
                        )}

                        <FormControlLabel
                          sx={{ m: 0, mr: 2 }}
                          control={
                            <Switch
                              size='small'
                              checked={isOpen}
                              onChange={(_event, checked) =>
                                handleStoreDayOpenToggle(day.key, checked)
                              }
                            />
                          }
                          label={isOpen ? 'Open' : 'Closed'}
                        />

                      </Box>
                    )
                  })}
                </Box>
              </CardContent>
            </Grid>

            <Grid size={{ xs: 12 }}>

              <Box sx={{ py: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <CustomAvatar variant='rounded' skin='light' color='success' size={36}>
                  <i className='ri-map-pin-line' />
                </CustomAvatar>
                <Box>
                  <Typography variant='h6' sx={{ fontWeight: 600 }}>
                    Google Map Location
                  </Typography>
                </Box>
              </Box>
              <CardContent>
                <Box sx={{ maxWidth: 980, mx: 'auto', width: '100%' }}>
                  {googleMapsLoadError && (
                    <Alert severity='warning' sx={{ mb: 2 }}>
                      Unable to load Google Maps right now. You can try again later.
                    </Alert>
                  )}

                  {!googleMapsLoadError && isGoogleMapsLoaded && (
                    <>
                      <Autocomplete onLoad={handleAutocompleteLoad} onPlaceChanged={handlePlaceChanged}>
                        <TextField
                          fullWidth
                          label='Search location'
                          placeholder='Type and select a location'
                          InputLabelProps={alwaysShrinkLabel}
                          sx={{ mb: 2 }}
                        />
                      </Autocomplete>

                      <Box
                        sx={theme => ({
                          height: { xs: 360, md: 430 },
                          borderRadius: 2,
                          overflow: 'hidden',
                          border: `1px solid ${theme.palette.divider}`,
                          mb: 2
                        })}
                      >
                        <GoogleMap
                          mapContainerStyle={{ width: '100%', height: '100%' }}
                          center={mapCenter}
                          zoom={selectedLocation.latitude !== null ? 15 : 10}
                          onClick={handleMapClick}
                          options={{
                            mapTypeControl: false,
                            streetViewControl: false,
                            fullscreenControl: false
                          }}
                        >
                          {selectedLocation.latitude !== null &&
                            selectedLocation.longitude !== null ? (
                            <MarkerF
                              position={{
                                lat: selectedLocation.latitude,
                                lng: selectedLocation.longitude
                              }}
                            />
                          ) : null}
                        </GoogleMap>
                      </Box>
                    </>
                  )}

                  {!googleMapsLoadError && !isGoogleMapsLoaded && (
                    <Box display='flex' alignItems='center' gap={1.5} sx={{ mb: 2 }}>
                      <CircularProgress size={20} />
                      <Typography variant='body2' color='text.secondary'>
                        Loading Google Maps...
                      </Typography>
                    </Box>
                  )}

                  <TextField
                    fullWidth
                    label='Selected Location'
                    value={selectedAddress || ''}
                    placeholder='No location selected yet'
                    InputLabelProps={alwaysShrinkLabel}
                    InputProps={{ readOnly: true }}
                  />
                </Box>

                <Box display='flex' justifyContent='flex-end' sx={{ mt: 2 }}>
                  <Button

                    color='error'
                    onClick={handleClearLocation}
                    disabled={!selectedAddress}
                  >
                    Clear Location
                  </Button>
                </Box>
              </CardContent>

            </Grid>

            {/* Logo and Favicon Section */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ py: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <CustomAvatar variant='rounded' skin='light' color='warning' size={36}>
                  <i className='ri-palette-line' />
                </CustomAvatar>
                <Box>
                  <Typography variant='h6' sx={{ fontWeight: 600 }}>
                    Branding
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
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
                      imgProps={{ style: { objectFit: 'contain' } }}
                      sx={theme => ({
                        width: 220,
                        height: 120,
                        p: 1.5,
                        // bgcolor: theme.palette.background.paper,
                        border: `1px dashed ${theme.palette.divider}`
                      })}
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

            <Grid size={{ xs: 12, md: 4 }}>
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
                      imgProps={{ style: { objectFit: 'contain' } }}
                      sx={theme => ({
                        width: 96,
                        height: 96,
                        p: 1,
                        // bgcolor: theme.palette.background.paper,
                        border: `1px dashed ${theme.palette.divider}`
                      })}
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

            <Grid size={{ xs: 12, md: 4 }}>
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
                      imgProps={{ style: { objectFit: 'contain' } }}
                      sx={theme => ({
                        width: 120,
                        height: 120,
                        p: 1.2,
                        // bgcolor: theme.palette.background.paper,
                        border: `1px dashed ${theme.palette.divider}`
                      })}
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
            <Grid size={{ xs: 12 }}>
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