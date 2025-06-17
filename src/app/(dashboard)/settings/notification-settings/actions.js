'use server'

import { fetchWithAuth } from '@/Auth/fetchWithAuth'

/**
 * Get notification settings
 */
export async function getNotificationSettings() {
  try {
    const response = await fetchWithAuth('/notificationSettings/viewNotificationSettings', {
      method: 'GET'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching notification settings:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Update notification settings
 */
export async function updateNotificationSettings(formData) {
  try {
    const response = await fetchWithAuth('/notificationSettings/updateNotificationSettings', {
      method: 'PUT',
      body: formData
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating notification settings:', error)
    return { success: false, message: error.message }
  }
}