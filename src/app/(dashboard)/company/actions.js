'use server'

import { fetchWithAuth } from '@/Auth/fetchWithAuth'

const COMPANY_API = {
  PROFILE: '/company',
}

const PROVINCES_CITIES = {
  PROVINCES: '/provincesCities/provinces',
  CITIES: '/provincesCities/cities',
}

export async function getCompanyProfile(companyId) {
  try {
    const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : ''
    const response = await fetchWithAuth(`${COMPANY_API.PROFILE}${query}`, {
      method: 'GET',
      cache: 'no-store',
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching company profile:', error)
    return { success: false, message: error.message }
  }
}


export async function getProvinces() {
  try {
    const response = await fetchWithAuth(PROVINCES_CITIES.PROVINCES, {
      method: 'GET',
      cache: 'no-store',
    })

    if (response.code === 200) {
      return { success: true, data: response.data || [] }
    }

    return { success: false, message: response.message || 'Failed to load provinces', data: [] }
  } catch (error) {
    console.error('Error fetching provinces:', error)
    return { success: false, message: error.message, data: [] }
  }
}

export async function getCitiesByProvince(province) {
  try {
    const trimmedProvince = String(province || '').trim()
    if (!trimmedProvince) {
      return { success: true, data: [] }
    }

    const response = await fetchWithAuth(
      `${PROVINCES_CITIES.CITIES}?province=${encodeURIComponent(trimmedProvince)}`,
      {
        method: 'GET',
        cache: 'no-store',
      }
    )

    if (response.code === 200) {
      return { success: true, data: response.data || [] }
    }

    return { success: false, message: response.message || 'Failed to load cities', data: [] }
  } catch (error) {
    console.error('Error fetching cities:', error)
    return { success: false, message: error.message, data: [] }
  }
}

export async function updateCompanyProfile(formData) {
  try {
    const response = await fetchWithAuth(COMPANY_API.PROFILE, {
      method: 'PUT',
      body: formData,
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating company profile:', error)
    return { success: false, message: error.message }
  }
}

