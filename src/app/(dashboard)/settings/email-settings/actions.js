'use server'

import { fetchWithAuth } from '@/Auth/fetchWithAuth'
import * as endPoints from '@/core/end_points/end_points'

/**
 * Get email settings
 */
export async function getEmailSettings() {
  try {
    const response = await fetchWithAuth(endPoints.EmailSettingsview, {
      method: 'GET'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching email settings:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Update email settings
 */
export async function updateEmailSettings(formData) {
  try {
    const response = await fetchWithAuth(endPoints.EmailSettingsupdate, {
      method: 'PUT',
      body: formData
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating email settings:', error)
    return { success: false, message: error.message }
  }
}