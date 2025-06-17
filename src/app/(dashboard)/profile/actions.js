'use server'

import { fetchWithAuth } from '@/Auth/fetchWithAuth'
import * as endPoints from '@/core/end_points/end_points'

/**
 * Profile Actions - Using the same endpoints as account settings for profile data
 */
export async function getProfile() {
  try {
    const response = await fetchWithAuth(endPoints.AccountSettingsview, {
      method: 'GET',
      cache: 'no-store'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching profile:', error)
    return { success: false, message: error.message }
  }
}

export async function updateProfile(formData) {
  try {
    const response = await fetchWithAuth(endPoints.AccountSettingsupdate, {
      method: 'PUT',
      body: formData
    })

    if (response.code === 200) {
      // Return the updated data from the response structure expected by backend
      return { success: true, data: response.data?.updatedData || response.data }
    } else {
      return { success: false, message: response.message || 'Failed to update profile' }
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { success: false, message: error.message }
  }
}