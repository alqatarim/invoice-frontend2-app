'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageIconHeader from '@components/headers/PageIconHeader'
import { usePermission } from '@/Auth/usePermission'
import { usePermissions } from '@/Auth/PermissionsContext'
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
  Divider,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material'
import { useDropzone } from 'react-dropzone'
import { Controller } from 'react-hook-form'
import { Autocomplete, GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api'
import CustomAvatar from '@core/components/mui/Avatar'
import { useTheme } from '@mui/material/styles'

const BRANDING_IMAGE_ACCEPT = 'image/jpeg,image/png,image/jpg,image/gif'

const BrandingDropzone = ({ preview, onSelectFile, onClear, readOnly }) => {
  const hasPreview = Boolean(preview)

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    multiple: false,
    disabled: readOnly,
    accept: BRANDING_IMAGE_ACCEPT,
    onDrop: acceptedFiles => {
      const file = acceptedFiles?.[0]
      if (file) onSelectFile(file)
    },
  })

  const isDraggingValidImage = isDragActive && isDragAccept

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      <Box
        {...getRootProps()}
        sx={theme => ({
          '@keyframes brandingDropPulse': {
            '0%, 100%': {
              boxShadow: `0 0 0 0 ${theme.palette.primary.main}33`,
            },
            '50%': {
              boxShadow: `0 0 0 6px ${theme.palette.primary.main}14`,
            },
          },
          width: 120,
          height: 120,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.75,
          p: 1,
          borderRadius: 1,
          overflow: 'hidden',
          border: '2px dashed',
          borderColor: isDragReject
            ? theme.palette.primary.main
            : isDraggingValidImage
              ? theme.palette.primary.main
              : theme.palette.divider,
          bgcolor: isDraggingValidImage
            ? theme.palette.action.hover
            : isDragReject
              ? theme.palette.action.hover
              : 'transparent',
          cursor: readOnly ? 'default' : 'pointer',
          transform: isDraggingValidImage ? 'scale(1.04)' : 'scale(1)',
          transition:
            'transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
          animation: isDraggingValidImage ? 'brandingDropPulse 1.2s ease-in-out infinite' : 'none',
        })}
      >
        <input {...getInputProps()} />
        {hasPreview ? (
          <Box
            component="img"
            src={preview}
            alt="Upload preview"
            sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        ) : (
          <>
            <CustomAvatar variant="rounded" skin="light" color="primary" size={40}>
              <i className="ri-upload-2-line" />
            </CustomAvatar>
            <Typography variant="caption" color="text.secondary">
              Click or drop
            </Typography>
          </>
        )}
      </Box>
      {hasPreview && !readOnly ? (
        <Button variant="outlined" color="error" size="small" onClick={onClear}>
          Remove
        </Button>
      ) : null}
    </Box>
  )
}

const CompanyProfile = ({ controller, initialErrorMessage = '' }) => {
  const router = useRouter()
  const permissions = usePermissions()
  const isPermissionsReady = Boolean(permissions?.isReady)
  const canView = usePermission('company', 'view')
  const canEdit = usePermission('company', 'update')
  const readOnly = !canEdit
  const theme = useTheme()

  const {
    updating,
    error,
    provinceOptions,
    storeHours,
    storeHourDays,
    mapCenter,
    selectedLocation,
    logoPreview,
    faviconPreview,
    companyIconPreview,
    cityOptions,
    citiesLoading,
    selectedProvince,
    register,
    handleSubmit,
    control,
    errors,
    setValue,
    clearErrors,
    watch,
    alwaysShrinkLabel,
    resetFormToSavedProfile,
    handleStoreHourChange,
    handleStoreDayOpenToggle,
    selectLogoFile,
    selectFaviconFile,
    selectCompanyIconFile,
    clearLogoSelection,
    clearFaviconSelection,
    clearCompanyIconSelection,
    handleAutocompleteLoad,
    handlePlaceChanged,
    handleMapClick,
    handleClearLocation,
    submitForm,
    googleMapsLoaderConfig,
  } = controller

  const {
    isLoaded: isGoogleMapsLoaded,
    loadError: googleMapsLoadError,
  } = useJsApiLoader(googleMapsLoaderConfig)

  const selectedAddress = watch('googleLocationAddress')

  useEffect(() => {
    if (!isPermissionsReady || canView) {
      return
    }

    router.replace('/dashboard')
  }, [isPermissionsReady, canView, router])

  const onSubmit = async data => {
    if (readOnly) {
      return
    }

    await submitForm(data)
  }

  if (!isPermissionsReady) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  if (!canView) {
    return null
  }

  return (
    <div className='flex flex-col gap-6'>
      <PageIconHeader title='Company Profile' icon='ri-building-line' />
      {initialErrorMessage ? (
        <Alert severity='error'>{initialErrorMessage}</Alert>
      ) : null}
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

            <fieldset
              disabled={readOnly}
              style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}
            >
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

                      <Grid size={{ xs: 12, sm: 6 }}>
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
                        <Controller
                          name='country'
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth required error={!!errors.country}>
                              <InputLabel id='company-country-label' shrink>
                                Country
                              </InputLabel>
                              <Select
                                {...field}
                                labelId='company-country-label'
                                label='Country'
                                notched
                              >

                                <MenuItem key='Saudi Arabia' value='Saudi Arabia'>
                                  Saudi Arabia
                                </MenuItem>

                              </Select>
                              {errors.country?.message ? (
                                <FormHelperText>{errors.country.message}</FormHelperText>
                              ) : null}
                            </FormControl>
                          )}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Controller
                          name='state'
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth required error={!!errors.state}>
                              <InputLabel id='company-province-label' shrink>
                                Province
                              </InputLabel>
                              <Select
                                {...field}
                                labelId='company-province-label'
                                label='Province'
                                notched
                                displayEmpty
                                onChange={event => {
                                  field.onChange(event.target.value)
                                  setValue('city', '', { shouldValidate: false })
                                  clearErrors('city')
                                }}
                              >
                                <MenuItem value='' disabled>
                                  Select Province
                                </MenuItem>
                                {provinceOptions.map(item => (
                                  <MenuItem key={item.province} value={item.province}>
                                    {item.display_name}
                                  </MenuItem>
                                ))}
                              </Select>
                              {errors.state?.message ? (
                                <FormHelperText>{errors.state.message}</FormHelperText>
                              ) : null}
                            </FormControl>
                          )}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Controller
                          name='city'
                          control={control}
                          render={({ field }) => (
                            <FormControl
                              fullWidth
                              required
                              error={!!errors.city}
                              disabled={!selectedProvince || citiesLoading}
                            >
                              <InputLabel id='company-city-label' shrink>
                                City
                              </InputLabel>
                              <Select
                                {...field}
                                labelId='company-city-label'
                                label='City'
                                notched
                                displayEmpty
                              >
                                <MenuItem value='' disabled>
                                  {citiesLoading ? 'Loading cities...' : 'Select City'}
                                </MenuItem>
                                {cityOptions.map(city => (
                                  <MenuItem key={city.name} value={city.name}>
                                    {city.name}
                                  </MenuItem>
                                ))}
                              </Select>
                              {errors.city?.message ? (
                                <FormHelperText>{errors.city.message}</FormHelperText>
                              ) : null}
                            </FormControl>
                          )}
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
                          label='Postal Code'
                          {...register('postalCode')}
                          InputLabelProps={alwaysShrinkLabel}
                          error={!!errors.postalCode}
                          helperText={errors.postalCode?.message}
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
                      {storeHourDays.map(day => {
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
                      <Typography variant="subtitle1" color='text.secondary' fontWeight={500}>
                        Site Logo
                      </Typography>
                      <Typography variant="caption" gutterBottom>
                        JPEG, PNG, JPG (Max 800*400px)
                      </Typography>
                      <BrandingDropzone
                        preview={logoPreview}
                        onSelectFile={selectLogoFile}
                        onClear={clearLogoSelection}
                        readOnly={readOnly}
                      />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" color='text.secondary' fontWeight={500}>
                        Favicon
                      </Typography>
                      <Typography variant="caption" gutterBottom>
                        JPEG, PNG, JPG (Max 35*35px)
                      </Typography>
                      <BrandingDropzone
                        preview={faviconPreview}
                        onSelectFile={selectFaviconFile}
                        onClear={clearFaviconSelection}
                        readOnly={readOnly}
                      />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" color='text.secondary' fontWeight={500}>
                        Company Icon
                      </Typography>
                      <Typography variant="caption" gutterBottom>
                        SVG, PNG, JPG (Max 100*100px)
                      </Typography>
                      <BrandingDropzone
                        preview={companyIconPreview}
                        onSelectFile={selectCompanyIconFile}
                        onClear={clearCompanyIconSelection}
                        readOnly={readOnly}
                      />
                    </CardContent>
                  </Card>
                </Grid>

                {!readOnly ? (
                  <Grid size={{ xs: 12 }}>
                    <Box display="flex" gap={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                      <Button
                        variant="outlined"
                        color='secondary'
                        onClick={resetFormToSavedProfile}
                        // startIcon={<Refresh />}
                        disabled={updating}
                      >
                        Reset
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        // startIcon={<Save />}
                        disabled={updating}
                      >
                        {updating ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </Box>
                  </Grid>
                ) : null}
              </Grid>
            </fieldset>
          </Box>
        </CardContent>
      </Card>
    </div>
  )
}

export default CompanyProfile