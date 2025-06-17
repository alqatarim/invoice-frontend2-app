'use server'

import { fetchWithAuth } from '@/Auth/fetchWithAuth'
import * as endPoints from '@/core/end_points/end_points'

/**
 * Get payment settings
 */
export async function getPaymentSettings() {
  try {
    const response = await fetchWithAuth(endPoints.paymentSettingsview, {
      method: 'GET'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching payment settings:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Update payment settings
 */
export async function updatePaymentSettings(formData) {
  try {
    const response = await fetchWithAuth(endPoints.paymentSettingsupdate, {
      method: 'PUT',
      body: formData
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating payment settings:', error)
    return { success: false, message: error.message }
  }
}