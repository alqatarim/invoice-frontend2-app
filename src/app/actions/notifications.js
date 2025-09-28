'use server'

import { fetchWithAuth } from '@/Auth/fetchWithAuth'

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

// Transform backend notification format to frontend format
const transformNotification = (backendNotification) => ({
     id: backendNotification._id,
     title: backendNotification.title,
     subtitle: backendNotification.body,
     time: backendNotification.createdAt
          ? new Date(backendNotification.createdAt).toLocaleString()
          : new Date().toLocaleString(),
     // Backend: mark = true (unread), mark = false (read)
     read: backendNotification.mark === false || backendNotification.mark === 'false',
     avatarIcon: 'ri-notification-2-line',
     avatarColor: 'primary',
     avatarSkin: 'light-static'
})

// Fetch notifications from backend
export async function getNotifications(skip = 0, limit = 50) {
     try {
          const response = await fetchWithAuth(`/notification/listNotification?skip=${skip}&limit=${limit}`)

          if (response.status === 'Success' && Array.isArray(response.data)) {
               return {
                    success: true,
                    data: response.data.map(transformNotification)
               }
          }

          return {
               success: false,
               error: 'Invalid response format',
               data: []
          }
     } catch (error) {
          console.error('Error fetching notifications:', error)
          return {
               success: false,
               error: error.message,
               data: []
          }
     }
}

// Delete individual notification
export async function deleteNotification(notificationId) {
     try {
          // Validate input
          if (!notificationId) {
               throw new Error('Notification ID is required')
          }

          const response = await fetchWithAuth('/notification/deleteNotification', {
               method: 'DELETE',
               body: JSON.stringify({ _id: [notificationId] })
          })

          return {
               success: response.status === 'Success',
               message: response.message || 'Notification deleted successfully'
          }
     } catch (error) {
          console.error('Error deleting notification:', error)
          return {
               success: false,
               error: error.message
          }
     }
}

// Clear all notifications
export async function clearAllNotifications() {
     try {
          const response = await fetchWithAuth('/notification/deleteNotification', {
               method: 'DELETE',
               body: JSON.stringify({ clearAll: true })
          })

          return {
               success: response.status === 'Success',
               message: response.message || 'All notifications cleared successfully'
          }
     } catch (error) {
          console.error('Error clearing all notifications:', error)
          return {
               success: false,
               error: error.message
          }
     }
}

// Mark individual notification as read
export async function markNotificationAsRead(notificationId) {
     try {
          // Validate input
          if (!notificationId) {
               throw new Error('Notification ID is required')
          }

          const response = await fetchWithAuth('/notification/markAsRead', {
               method: 'PUT',
               body: JSON.stringify({ notificationId })
          })

          return {
               success: response.status === 'Success',
               message: response.message || 'Notification marked as read'
          }
     } catch (error) {
          console.error('Error marking notification as read:', error)
          return {
               success: false,
               error: error.message
          }
     }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead() {
     try {
          const response = await fetchWithAuth('/notification/', {
               method: 'PUT'
          })

          return {
               success: response.status === 'Success',
               message: response.message || 'All notifications marked as read'
          }
     } catch (error) {
          console.error('Error marking all notifications as read:', error)
          return {
               success: false,
               error: error.message
          }
     }
}
