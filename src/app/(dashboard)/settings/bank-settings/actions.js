'use server'

import { fetchWithAuth } from '@/Auth/fetchWithAuth'
import * as endPoints from '@/core/end_points/end_points'

/**
 * Get initial data for bank settings list
 */
export async function getInitialBankSettingsData() {
  try {
    const response = await fetchWithAuth(endPoints.BankSettings.List, {
      method: 'GET'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching bank settings:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Get bank by ID
 */
export async function getBankById(id) {
  try {
    const response = await fetchWithAuth(`${endPoints.BankSettings.View}/${id}`, {
      method: 'GET'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching bank by id:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Add new bank settings
 */
export async function addBankSettings(formData) {
  try {
    const response = await fetchWithAuth(endPoints.BankSettings.Add, {
      method: 'POST',
      body: formData
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error adding bank settings:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Update bank settings
 */
export async function updateBankSettings(id, formData) {
  try {
    const response = await fetchWithAuth(`${endPoints.BankSettings.Upadte}/${id}`, {
      method: 'PUT',
      body: formData
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating bank settings:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Delete bank settings
 */
export async function deleteBankSettings(ids) {
  try {
    const response = await fetchWithAuth(endPoints.BankSettings.Delete, {
      method: 'POST',
      body: JSON.stringify({ ids }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error deleting bank settings:', error)
    return { success: false, message: error.message }
  }
}