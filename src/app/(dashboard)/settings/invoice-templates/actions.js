'use server'

import { fetchWithAuth } from '@/Auth/fetchWithAuth'
import * as endPoints from '@/core/end_points/end_points'

/**
 * Get default invoice template
 */
export async function getDefaultInvoiceTemplate() {
  try {
    const response = await fetchWithAuth(endPoints.invoiceTemplate.view, {
      method: 'GET'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching default invoice template:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Update default invoice template
 */
export async function updateDefaultInvoiceTemplate(templateId) {
  try {
    const response = await fetchWithAuth(endPoints.invoiceTemplate.update, {
      method: 'PUT',
      body: JSON.stringify({ defaultInvoiceTemplate: templateId }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating default invoice template:', error)
    return { success: false, message: error.message }
  }
}