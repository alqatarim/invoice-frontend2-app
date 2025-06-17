'use server'

// export const dynamic = 'force-dynamic'

import { fetchWithAuth } from '@/Auth/fetchWithAuth'
import * as endPoints from '@/core/end_points/end_points'

/**
 * Get initial data for signatures list
 */
export async function getInitialSignaturesData() {
  try {
    const response = await fetchWithAuth(endPoints.signatures_api.List, {
      method: 'GET'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching signatures:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Get signature by ID
 */
export async function getSignatureById(id) {
  try {
    const response = await fetchWithAuth(`${endPoints.signatures_api.View}/${id}`, {
      method: 'GET'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching signature by id:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Add new signature
 */
export async function addSignature(formData) {
  try {
    const response = await fetchWithAuth(endPoints.signatures_api.Add, {
      method: 'POST',
      body: formData
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error adding signature:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Update signature
 */
export async function updateSignature(id, formData) {
  try {
    const response = await fetchWithAuth(`${endPoints.signatures_api.Update}/${id}`, {
      method: 'PUT',
      body: formData
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating signature:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Delete signatures
 */
export async function deleteSignatures(ids) {
  try {
    const response = await fetchWithAuth(endPoints.signatures_api.Delete, {
      method: 'POST',
      body: JSON.stringify({ ids }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error deleting signatures:', error)
    return { success: false, message: error.message }
  }
}