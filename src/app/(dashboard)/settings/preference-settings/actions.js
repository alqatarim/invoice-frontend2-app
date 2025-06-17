'use server'

import { fetchWithAuth } from '@/Auth/fetchWithAuth'
import * as endPoints from '@/core/end_points/end_points'

/**
 * Get preference settings
 */
export async function getPreferenceSettings() {
  try {
    const response = await fetchWithAuth(endPoints.preferenceSettingsview, {
      method: 'GET'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching preference settings:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Update preference settings
 */
export async function updatePreferenceSettings(formData) {
  try {
    const response = await fetchWithAuth(endPoints.preferenceSettingsupdate, {
      method: 'PUT',
      body: formData
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating preference settings:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Get currencies (for preference settings dropdown)
 */
export async function getCurrencies() {
  try {
    const response = await fetchWithAuth(endPoints.CurrencyAPI, {
      method: 'GET'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching currencies:', error)
    return { success: false, message: error.message }
  }
}