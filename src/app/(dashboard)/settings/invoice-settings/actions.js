'use server'

import { fetchWithAuth } from '@/Auth/fetchWithAuth'
import * as endPoints from '@/core/end_points/end_points'

/**
 * Get invoice settings
 */
export async function getInvoiceSettings() {
  try {
    const response = await fetchWithAuth(endPoints.InvoiceSettingsview, {
      method: 'GET'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching invoice settings:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Update invoice settings
 */
export async function updateInvoiceSettings(formData) {
  try {
    const response = await fetchWithAuth(endPoints.InvoiceSettingsUpdate, {
      method: 'PUT',
      body: formData
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating invoice settings:', error)
    return { success: false, message: error.message }
  }
}