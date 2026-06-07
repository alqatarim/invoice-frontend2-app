'use client'

import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material'
import { Autocomplete, GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api'
import SectionHeader from '@components/headers/SectionHeader'

const CompanyLocation = ({
  alwaysShrinkLabel,
  mapCenter,
  selectedLocation,
  selectedAddress,
  handleAutocompleteLoad,
  handlePlaceChanged,
  handleMapClick,
  handleClearLocation,
  googleMapsLoaderConfig,
}) => {
  const { isLoaded: isGoogleMapsLoaded, loadError: googleMapsLoadError } =
    useJsApiLoader(googleMapsLoaderConfig)

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent
        sx={{
          height: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            maxWidth: 980,
            mx: 'auto',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <SectionHeader
            title='Google Map Location'
            icon='ri-map-pin-line'
            color='success'
            className='mb-5'
          />

          {googleMapsLoadError && (
            <Alert severity='warning' sx={{ mb: 2, flexShrink: 0 }}>
              Unable to load Google Maps right now. You can try again later.
            </Alert>
          )}

          {!googleMapsLoadError && isGoogleMapsLoaded && (
            <>
              <Box sx={{ flexShrink: 0, mb: 2 }}>
                <Autocomplete onLoad={handleAutocompleteLoad} onPlaceChanged={handlePlaceChanged}>
                  <TextField
                    fullWidth
                    label='Search location'
                    placeholder='Type and select a location'
                    InputLabelProps={alwaysShrinkLabel}
                  />
                </Autocomplete>
              </Box>

              <Box
                sx={theme => ({
                  flex: 1,
                  minHeight: 0,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: `1px solid ${theme.palette.divider}`,
                  mb: 2,
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
                    fullscreenControl: false,
                  }}
                >
                  {selectedLocation.latitude !== null && selectedLocation.longitude !== null ? (
                    <MarkerF
                      position={{
                        lat: selectedLocation.latitude,
                        lng: selectedLocation.longitude,
                      }}
                    />
                  ) : null}
                </GoogleMap>
              </Box>
            </>
          )}

          {!googleMapsLoadError && !isGoogleMapsLoaded && (
            <Box display='flex' alignItems='center' gap={1.5} sx={{ mb: 2, flexShrink: 0 }}>
              <CircularProgress size={20} />
              <Typography variant='body2' color='text.secondary'>
                Loading Google Maps...
              </Typography>
            </Box>
          )}

          <Box sx={{ flexShrink: 0 }}>
            <TextField
              fullWidth
              label='Selected Location'
              value={selectedAddress || ''}
              placeholder='No location selected yet'
              InputLabelProps={alwaysShrinkLabel}
              InputProps={{ readOnly: true }}
            />

            <Box display='flex' justifyContent='flex-end' sx={{ mt: 2 }}>
              <Button color='error' onClick={handleClearLocation} disabled={!selectedAddress}>
                Clear Location
              </Button>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default CompanyLocation
