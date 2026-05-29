'use server'

import { fetchWithAuth } from '@/Auth/fetchWithAuth'

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

export async function getUnreadNotificationCount() {
     try {
          const response = await fetchWithAuth('/notification/unreadCount')
          const count = Number(response?.data?.count || 0)

          if (response.status === 'Success') {
               return {
                    success: true,
                    count
               }
          }

          return {
               success: false,
               error: 'Invalid response format',
               count: 0
          }
     } catch (error) {
          console.error('Error fetching notification count:', error)
          return {
               success: false,
               error: error.message,
               count: 0
          }
     }
}

export async function getNotifications(skip = 0, limit = 20) {
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

export async function deleteNotification(notificationId) {
     try {
          if (!notificationId) {
               throw new Error('Notification ID is required')
          }

          const response = await fetchWithAuth(`/notification/deleteNotification/${notificationId}`, {
               method: 'DELETE'
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

export async function clearAllNotifications() {
     try {
          const response = await fetchWithAuth('/notification/clearAllNotifications', {
               method: 'DELETE'
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

export async function markNotificationAsRead(notificationId) {
     try {
          if (!notificationId) {
               throw new Error('Notification ID is required')
          }

          const response = await fetchWithAuth(`/notification/markAsRead/${notificationId}`, {
               method: 'PUT'
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
