'use server'

import { fetchWithAuth } from '@/Auth/fetchWithAuth'
import * as endPoints from '@/core/end_points/end_points'

/**
 * Get company settings
 */
export async function getCompanySettings() {


  //export const CompanysettingView = `/companySettings/viewCompanySetting`;
  try {



    const response = await fetchWithAuth(`/companySettings/viewCompanySetting`);
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching company settings:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Update company settings
 */
export async function updateCompanySettings(formData) {
  try {
    const response = await fetchWithAuth(endPoints.CompanysettingUpdate, {
      method: 'PUT',
      body: formData
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating company settings:', error)
    return { success: false, message: error.message }
  }
}