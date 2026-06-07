'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageIconHeader from '@components/headers/PageIconHeader'
import { usePermission } from '@/Auth/usePermission'
import { usePermissions } from '@/Auth/PermissionsContext'
import {
  Box,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material'
import CompanyInfo from './components/companyInfo'
import CompanyHours from './components/companyHours'
import CompanyLocation from './components/companyLocation'
import CompanyBranding from './components/companyBranding'

const TAB_PANEL_MIN_HEIGHT = 540

const CompanyProfile = ({ controller, initialErrorMessage = '' }) => {
  const router = useRouter()
  const permissions = usePermissions()
  const isPermissionsReady = Boolean(permissions?.isReady)
  const canView = usePermission('company', 'view')
  const canEdit = usePermission('company', 'update')
  const readOnly = !canEdit
  const [activeTab, setActiveTab] = useState(0)

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

      {error ? (
        <Alert severity='error'>{error}</Alert>
      ) : null}

      <Box component='form' onSubmit={handleSubmit(onSubmit)}>
        <input type='hidden' {...register('googleLocationAddress')} />
        <input type='hidden' {...register('googleLocationPlaceId')} />
        <input type='hidden' {...register('googleLocationLat')} />
        <input type='hidden' {...register('googleLocationLng')} />

        <fieldset
          disabled={readOnly}
          style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}
        >
          <Tabs
            value={activeTab}
            onChange={(_event, value) => setActiveTab(value)}
            // variant='fullWidth'
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}
          >
            <Tab icon={<i className='ri-building-line' />} iconPosition='start' label='Information' />
            <Tab icon={<i className='ri-time-line' />} iconPosition='start' label='Store Hours' />
            <Tab icon={<i className='ri-map-pin-line' />} iconPosition='start' label='Location' />
            <Tab icon={<i className='ri-palette-line' />} iconPosition='start' label='Branding' />
          </Tabs>

          <Box sx={{ height: TAB_PANEL_MIN_HEIGHT }}>
            <Box
              role='tabpanel'
              hidden={activeTab !== 0}
              sx={{ display: activeTab === 0 ? 'block' : 'none', height: '100%' }}
            >
              <CompanyInfo
                register={register}
                control={control}
                errors={errors}
                setValue={setValue}
                clearErrors={clearErrors}
                alwaysShrinkLabel={alwaysShrinkLabel}
                provinceOptions={provinceOptions}
                cityOptions={cityOptions}
                citiesLoading={citiesLoading}
                selectedProvince={selectedProvince}
              />
            </Box>

            <Box
              role='tabpanel'
              hidden={activeTab !== 1}
              sx={{ display: activeTab === 1 ? 'block' : 'none', height: '100%' }}
            >
              <CompanyHours
                storeHours={storeHours}
                storeHourDays={storeHourDays}
                handleStoreHourChange={handleStoreHourChange}
                handleStoreDayOpenToggle={handleStoreDayOpenToggle}
              />
            </Box>

            <Box
              role='tabpanel'
              hidden={activeTab !== 2}
              sx={{ display: activeTab === 2 ? 'block' : 'none', height: '100%' }}
            >
              <CompanyLocation
                alwaysShrinkLabel={alwaysShrinkLabel}
                mapCenter={mapCenter}
                selectedLocation={selectedLocation}
                selectedAddress={selectedAddress}
                handleAutocompleteLoad={handleAutocompleteLoad}
                handlePlaceChanged={handlePlaceChanged}
                handleMapClick={handleMapClick}
                handleClearLocation={handleClearLocation}
                googleMapsLoaderConfig={googleMapsLoaderConfig}
              />
            </Box>

            <Box
              role='tabpanel'
              hidden={activeTab !== 3}
              sx={{ display: activeTab === 3 ? 'block' : 'none', height: '100%' }}
            >
              <CompanyBranding
                logoPreview={logoPreview}
                faviconPreview={faviconPreview}
                companyIconPreview={companyIconPreview}
                selectLogoFile={selectLogoFile}
                selectFaviconFile={selectFaviconFile}
                selectCompanyIconFile={selectCompanyIconFile}
                clearLogoSelection={clearLogoSelection}
                clearFaviconSelection={clearFaviconSelection}
                clearCompanyIconSelection={clearCompanyIconSelection}
                readOnly={readOnly}
              />
            </Box>
          </Box>

          {!readOnly ? (
            <Box display='flex' gap={2} justifyContent='flex-end' sx={{ mt: 4 }}>
              <Button
                variant='outlined'
                color='secondary'
                onClick={resetFormToSavedProfile}
                disabled={updating}
              >
                Reset
              </Button>
              <Button type='submit' variant='contained' disabled={updating}>
                {updating ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          ) : null}
        </fieldset>
      </Box>
    </div>
  )
}

export default CompanyProfile
