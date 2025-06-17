'use server'

import { fetchWithAuth } from '@/Auth/fetchWithAuth'
import * as endPoints from '@/core/end_points/end_points'

/**
 * Change password
 */
export async function changePassword(formData) {
  try {
    const response = await fetchWithAuth(endPoints.change_password, {
      method: 'POST',
      body: JSON.stringify({
        oldPassword: formData.get('oldPassword'),
        newPassword: formData.get('newPassword')
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error changing password:', error)
    return { success: false, message: error.message }
  }
}