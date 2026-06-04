'use client'

import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import * as companyActions from '@/app/(dashboard)/company/actions'
import { companyProfileSchema } from './companyProfileSchema'
import { normalizeCompanyProfile } from './normalizeCompanyProfile'

export const DEFAULT_MAP_CENTER = { lat: 24.7136, lng: 46.6753 }
export const GOOGLE_MAP_LIBRARIES = ['places']
export const GOOGLE_PLACES_API_KEY =
     process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyClYD8Rg81sa6Hl1xUOFv5tTO0cg9bz8Vs'

export const STORE_HOUR_DAYS = [
     { key: 'monday', label: 'Monday' },
     { key: 'tuesday', label: 'Tuesday' },
     { key: 'wednesday', label: 'Wednesday' },
     { key: 'thursday', label: 'Thursday' },
     { key: 'friday', label: 'Friday' },
     { key: 'saturday', label: 'Saturday' },
     { key: 'sunday', label: 'Sunday' },
]

export const COMPANY_FORM_DEFAULT_VALUES = {
     companyName: '',
     email: '',
     phone: '',
     addressLine1: '',
     addressLine2: '',
     city: '',
     state: '',
     country: 'Saudi Arabia',
     postalCode: '',
     googleLocationAddress: '',
     googleLocationPlaceId: '',
     googleLocationLat: '',
     googleLocationLng: '',
}

const GOOGLE_LOCATION_FORM_KEYS = [
     'googleLocationAddress',
     'googleLocationPlaceId',
     'googleLocationLat',
     'googleLocationLng',
]

const getErrorMessage = (error, fallbackMessage) => error?.message || fallbackMessage

export const createDefaultStoreHours = () =>
     STORE_HOUR_DAYS.reduce((acc, day) => {
          acc[day.key] = {
               open: '09:00',
               close: '18:00',
               isClosed: false,
          }
          return acc
     }, {})

export const normalizeStoreHours = (storeHours = {}) =>
     STORE_HOUR_DAYS.reduce((acc, day) => {
          const source = storeHours?.[day.key] || {}
          acc[day.key] = {
               open: typeof source.open === 'string' && source.open ? source.open : '09:00',
               close: typeof source.close === 'string' && source.close ? source.close : '18:00',
               isClosed: Boolean(source.isClosed),
          }
          return acc
     }, {})

export const getGoogleLocationFromProfile = (profile = {}) =>
     profile?.googleLocation || {
          placeId: profile?.googleLocationPlaceId || '',
          formattedAddress: profile?.googleLocationAddress || '',
          latitude: profile?.googleLocationLat ?? null,
          longitude: profile?.googleLocationLng ?? null,
     }

export const getCompanyProfileFormValues = (profile = {}) => {
     const googleLocation = getGoogleLocationFromProfile(profile)

     return {
          companyName: profile.companyName || '',
          email: profile.email || '',
          phone: profile.phone || '',
          addressLine1: profile.addressLine1 || '',
          addressLine2: profile.addressLine2 || '',
          city: profile.city || '',
          state: profile.state || '',
          country: profile.country || 'Saudi Arabia',
          postalCode: profile.postalCode || profile.pincode || '',
          googleLocationAddress: googleLocation.formattedAddress || '',
          googleLocationPlaceId: googleLocation.placeId || '',
          googleLocationLat:
               googleLocation?.latitude !== null && googleLocation?.latitude !== undefined
                    ? String(googleLocation.latitude)
                    : '',
          googleLocationLng:
               googleLocation?.longitude !== null && googleLocation?.longitude !== undefined
                    ? String(googleLocation.longitude)
                    : '',
     }
}

export const buildCompanyProfileFormData = (data, storeHours, files = {}, removals = {}) => {
     const formData = new FormData()

     Object.keys(data).forEach(key => {
          if (GOOGLE_LOCATION_FORM_KEYS.includes(key)) {
               return
          }

          if (data[key]) {
               formData.append(key, data[key])
          }
     })

     GOOGLE_LOCATION_FORM_KEYS.forEach(key => {
          formData.append(key, data[key] ?? '')
     })
     formData.append('storeHours', JSON.stringify(storeHours))

     if (files.siteLogo) {
          formData.append('siteLogo', files.siteLogo)
     } else if (removals.removeSiteLogo) {
          formData.append('removeSiteLogo', 'true')
     }
     if (files.favicon) {
          formData.append('favicon', files.favicon)
     } else if (removals.removeFavicon) {
          formData.append('removeFavicon', 'true')
     }
     if (files.companyLogo) {
          formData.append('companyLogo', files.companyLogo)
     } else if (removals.removeCompanyLogo) {
          formData.append('removeCompanyLogo', 'true')
     }

     return formData
}

const useCompanyProfileHandler = ({
     initialCompanyProfile = {},
     initialProvinces = [],
     onNotify,
} = {}) => {
     const [companyProfile, setCompanyProfile] = useState(() =>
          normalizeCompanyProfile(initialCompanyProfile)
     )
     const [updating, setUpdating] = useState(false)
     const [error, setError] = useState(null)

     const [logoPreview, setLogoPreview] = useState(null)
     const [faviconPreview, setFaviconPreview] = useState(null)
     const [companyIconPreview, setCompanyIconPreview] = useState(null)
     const [selectedLogo, setSelectedLogo] = useState(null)
     const [selectedFavicon, setSelectedFavicon] = useState(null)
     const [selectedCompanyIcon, setSelectedCompanyIcon] = useState(null)
     const [removeSiteLogo, setRemoveSiteLogo] = useState(false)
     const [removeFavicon, setRemoveFavicon] = useState(false)
     const [removeCompanyLogo, setRemoveCompanyLogo] = useState(false)
     const [storeHours, setStoreHours] = useState(() => createDefaultStoreHours())
     const [mapCenter, setMapCenter] = useState(DEFAULT_MAP_CENTER)
     const [selectedLocation, setSelectedLocation] = useState({
          placeId: '',
          formattedAddress: '',
          latitude: null,
          longitude: null,
     })
     const [autocompleteInstance, setAutocompleteInstance] = useState(null)
     const [cityOptions, setCityOptions] = useState([])
     const [citiesLoading, setCitiesLoading] = useState(false)

     const provinceOptions = Array.isArray(initialProvinces) ? initialProvinces : []

     const form = useForm({
          mode: 'onSubmit',
          reValidateMode: 'onSubmit',
          resolver: yupResolver(companyProfileSchema),
          defaultValues: COMPANY_FORM_DEFAULT_VALUES,
     })

     const { register, handleSubmit, control, reset, setValue, clearErrors, watch, formState } = form
     const { errors } = formState

     const applySelectedLocation = useCallback(
          (location = {}, options = {}) => {
               const shouldMarkDirty = options.markDirty ?? true
               const lat = Number(location.latitude)
               const lng = Number(location.longitude)
               const hasValidCoordinates = Number.isFinite(lat) && Number.isFinite(lng)

               const normalizedLocation = {
                    placeId: location.placeId || '',
                    formattedAddress: location.formattedAddress || '',
                    latitude: hasValidCoordinates ? lat : null,
                    longitude: hasValidCoordinates ? lng : null,
               }

               setSelectedLocation(normalizedLocation)
               setValue('googleLocationAddress', normalizedLocation.formattedAddress, {
                    shouldDirty: shouldMarkDirty,
               })
               setValue('googleLocationPlaceId', normalizedLocation.placeId, { shouldDirty: shouldMarkDirty })
               setValue(
                    'googleLocationLat',
                    hasValidCoordinates ? String(normalizedLocation.latitude) : '',
                    { shouldDirty: shouldMarkDirty }
               )
               setValue(
                    'googleLocationLng',
                    hasValidCoordinates ? String(normalizedLocation.longitude) : '',
                    { shouldDirty: shouldMarkDirty }
               )

               if (hasValidCoordinates) {
                    setMapCenter({ lat, lng })
               }
          },
          [setValue]
     )

     const applyProfileToForm = useCallback(
          (profile = {}) => {
               const normalizedProfile = normalizeCompanyProfile(profile)
               const googleLocation = getGoogleLocationFromProfile(normalizedProfile)
               const normalizedStoreHours = normalizeStoreHours(normalizedProfile?.storeHours || {})

               reset(getCompanyProfileFormValues(normalizedProfile))
               applySelectedLocation(
                    {
                         placeId: googleLocation?.placeId || '',
                         formattedAddress: googleLocation?.formattedAddress || '',
                         latitude: googleLocation?.latitude,
                         longitude: googleLocation?.longitude,
                    },
                    { markDirty: false }
               )
               setStoreHours(normalizedStoreHours)
               setLogoPreview(normalizedProfile.siteLogo?.trim() || null)
               setFaviconPreview(normalizedProfile.favicon?.trim() || null)
               setCompanyIconPreview(normalizedProfile.companyLogo?.trim() || null)
               setSelectedLogo(null)
               setSelectedFavicon(null)
               setSelectedCompanyIcon(null)
               setRemoveSiteLogo(false)
               setRemoveFavicon(false)
               setRemoveCompanyLogo(false)
          },
          [applySelectedLocation, reset]
     )

     useEffect(() => {
          applyProfileToForm(companyProfile)
     }, [companyProfile, applyProfileToForm])

     const loadCitiesForProvince = useCallback(async province => {
          const trimmedProvince = String(province || '').trim()
          if (!trimmedProvince) {
               setCityOptions([])
               return
          }

          setCitiesLoading(true)
          try {
               const result = await companyActions.getCitiesByProvince(trimmedProvince)
               setCityOptions(result?.success ? result.data || [] : [])
          } catch {
               setCityOptions([])
          } finally {
               setCitiesLoading(false)
          }
     }, [])

     const selectedProvince = watch('state')

     useEffect(() => {
          if (selectedProvince) {
               loadCitiesForProvince(selectedProvince)
          } else {
               setCityOptions([])
          }
     }, [selectedProvince, loadCitiesForProvince])

     const updateCompanyProfile = useCallback(async payload => {
          setUpdating(true)
          setError(null)

          try {
               const result = await companyActions.updateCompanyProfile(payload)

               if (result.success) {
                    setCompanyProfile(normalizeCompanyProfile(result.data))
                    return result
               }

               throw new Error(result.message)
          } catch (updateError) {
               setError(getErrorMessage(updateError, 'Failed to update company profile'))
               throw updateError
          } finally {
               setUpdating(false)
          }
     }, [])

     const resetFormToSavedProfile = useCallback(() => {
          clearErrors()
          setError(null)
          applyProfileToForm(companyProfile)
          setMapCenter(DEFAULT_MAP_CENTER)
     }, [applyProfileToForm, clearErrors, companyProfile])

     const handleStoreHourChange = useCallback((dayKey, field, value) => {
          setStoreHours(prev => ({
               ...prev,
               [dayKey]: {
                    ...prev[dayKey],
                    [field]: value,
               },
          }))
     }, [])

     const handleStoreDayOpenToggle = useCallback((dayKey, isOpen) => {
          setStoreHours(prev => ({
               ...prev,
               [dayKey]: {
                    ...prev[dayKey],
                    isClosed: !isOpen,
               },
          }))
     }, [])

     const setBrandingImageFile = useCallback((file, { setFile, setPreview, clearRemoveFlag }) => {
          if (!file || !file.type?.startsWith('image/')) {
               return
          }

          clearRemoveFlag?.()
          setFile(file)
          const reader = new FileReader()
          reader.onloadend = () => {
               setPreview(reader.result)
          }
          reader.readAsDataURL(file)
     }, [])

     const selectLogoFile = useCallback(
          file =>
               setBrandingImageFile(file, {
                    setFile: setSelectedLogo,
                    setPreview: setLogoPreview,
                    clearRemoveFlag: () => setRemoveSiteLogo(false),
               }),
          [setBrandingImageFile]
     )

     const selectFaviconFile = useCallback(
          file =>
               setBrandingImageFile(file, {
                    setFile: setSelectedFavicon,
                    setPreview: setFaviconPreview,
                    clearRemoveFlag: () => setRemoveFavicon(false),
               }),
          [setBrandingImageFile]
     )

     const selectCompanyIconFile = useCallback(
          file =>
               setBrandingImageFile(file, {
                    setFile: setSelectedCompanyIcon,
                    setPreview: setCompanyIconPreview,
                    clearRemoveFlag: () => setRemoveCompanyLogo(false),
               }),
          [setBrandingImageFile]
     )

     const clearLogoSelection = useCallback(() => {
          if (selectedLogo) {
               setSelectedLogo(null)
               setLogoPreview(removeSiteLogo ? null : companyProfile.siteLogo?.trim() || null)
               return
          }

          setSelectedLogo(null)
          setLogoPreview(null)
          setRemoveSiteLogo(true)
     }, [companyProfile.siteLogo, removeSiteLogo, selectedLogo])

     const clearFaviconSelection = useCallback(() => {
          if (selectedFavicon) {
               setSelectedFavicon(null)
               setFaviconPreview(removeFavicon ? null : companyProfile.favicon?.trim() || null)
               return
          }

          setSelectedFavicon(null)
          setFaviconPreview(null)
          setRemoveFavicon(true)
     }, [companyProfile.favicon, removeFavicon, selectedFavicon])

     const clearCompanyIconSelection = useCallback(() => {
          if (selectedCompanyIcon) {
               setSelectedCompanyIcon(null)
               setCompanyIconPreview(
                    removeCompanyLogo ? null : companyProfile.companyLogo?.trim() || null
               )
               return
          }

          setSelectedCompanyIcon(null)
          setCompanyIconPreview(null)
          setRemoveCompanyLogo(true)
     }, [companyProfile.companyLogo, removeCompanyLogo, selectedCompanyIcon])

     const handleAutocompleteLoad = useCallback(autocomplete => {
          setAutocompleteInstance(autocomplete)
     }, [])

     const handlePlaceChanged = useCallback(() => {
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
               longitude,
          })
     }, [applySelectedLocation, autocompleteInstance])

     const handleMapClick = useCallback(
          event => {
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
                              longitude,
                         })
                    })

                    return
               }

               applySelectedLocation({
                    placeId: '',
                    formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                    latitude,
                    longitude,
               })
          },
          [applySelectedLocation]
     )

     const handleClearLocation = useCallback(() => {
          applySelectedLocation(
               {
                    placeId: '',
                    formattedAddress: '',
                    latitude: null,
                    longitude: null,
               },
               { markDirty: true }
          )
          setMapCenter(DEFAULT_MAP_CENTER)
     }, [applySelectedLocation])

     const submitForm = useCallback(
          async data => {
               const formData = buildCompanyProfileFormData(
                    data,
                    storeHours,
                    {
                         siteLogo: selectedLogo,
                         favicon: selectedFavicon,
                         companyLogo: selectedCompanyIcon,
                    },
                    {
                         removeSiteLogo,
                         removeFavicon,
                         removeCompanyLogo,
                    }
               )

               try {
                    const result = await updateCompanyProfile(formData)
                    if (result?.success) {
                         onNotify?.('Company profile updated successfully', { variant: 'success' })
                    } else {
                         onNotify?.(result?.message || 'Failed to update company profile', { variant: 'error' })
                    }
                    return result
               } catch (updateError) {
                    onNotify?.(updateError?.message || 'Failed to update company profile', { variant: 'error' })
                    return { success: false, message: updateError?.message }
               }
          },
          [
               onNotify,
               removeCompanyLogo,
               removeFavicon,
               removeSiteLogo,
               selectedCompanyIcon,
               selectedFavicon,
               selectedLogo,
               storeHours,
               updateCompanyProfile,
          ]
     )

     const clearError = useCallback(() => setError(null), [])

     return {
          updating,
          error,
          clearError,
          provinceOptions,
          storeHours,
          storeHourDays: STORE_HOUR_DAYS,
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
          alwaysShrinkLabel: { shrink: true },
          applySelectedLocation,
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
          googleMapsLoaderConfig: {
               id: 'company-profile-google-map-script',
               googleMapsApiKey: GOOGLE_PLACES_API_KEY,
               libraries: GOOGLE_MAP_LIBRARIES,
          },
     }
}

export default useCompanyProfileHandler
