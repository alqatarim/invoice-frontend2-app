'use server'

import { fetchWithAuth } from '@/Auth/fetchWithAuth'
import * as endPoints from '@/core/end_points/end_points'

/**
 * Get account settings
 */
export async function getAccountSettings() {
  try {
    const response = await fetchWithAuth(endPoints.AccountSettingsview, {
      method: 'GET'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching account settings:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Update account settings
 */
export async function updateAccountSettings(formData) {
  try {
    const response = await fetchWithAuth(endPoints.AccountSettingsupdate, {
      method: 'PUT',
      body: formData
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating account settings:', error)
    return { success: false, message: error.message }
  }
}