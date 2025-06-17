'use server'

import { fetchWithAuth } from '@/Auth/fetchWithAuth'
import * as endPoints from '@/core/end_points/end_points'

/**
 * Get initial data for tax settings list
 */
export async function getInitialTaxSettingsData() {
  try {
    const response = await fetchWithAuth(endPoints.TaxRateAPI.List, {
      method: 'GET'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching tax settings:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Get tax by ID
 */
export async function getTaxById(id) {
  try {
    const response = await fetchWithAuth(`${endPoints.TaxRateAPI.View}/${id}`, {
      method: 'GET'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching tax by id:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Add new tax settings
 */
export async function addTaxSettings(formData) {
  try {
    const response = await fetchWithAuth(endPoints.TaxRateAPI.Add, {
      method: 'POST',
      body: formData
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error adding tax settings:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Update tax settings
 */
export async function updateTaxSettings(id, formData) {
  try {
    const response = await fetchWithAuth(`${endPoints.TaxRateAPI.Upadte}/${id}`, {
      method: 'PUT',
      body: formData
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating tax settings:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Delete tax settings
 */
export async function deleteTaxSettings(ids) {
  try {
    const response = await fetchWithAuth(endPoints.TaxRateAPI.Delete, {
      method: 'POST',
      body: JSON.stringify({ ids }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error deleting tax settings:', error)
    return { success: false, message: error.message }
  }
}