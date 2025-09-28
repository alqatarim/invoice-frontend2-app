'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import {
     getNotifications,
     deleteNotification,
     clearAllNotifications,
     markAllNotificationsAsRead,
     markNotificationAsRead
} from '@/app/actions/notifications'

export const useNotifications = () => {
     const [notifications, setNotifications] = useState([])
     const [loading, setLoading] = useState(false)
     const { data: session, status } = useSession()

     // Fetch notifications
     const fetchNotifications = useCallback(async () => {
          if (status !== 'authenticated' || !session?.user?.token) return

          setLoading(true)
          try {
               const result = await getNotifications()
               if (result.success) {
                    setNotifications(result.data)
               } else {
                    console.error('Failed to fetch notifications:', result.error)
               }
          } catch (error) {
               console.error('Error fetching notifications:', error)
          } finally {
               setLoading(false)
          }
     }, [status, session?.user?.token])

     // Mark notification as read (with backend persistence)
     const markAsRead = useCallback(async (notificationId) => {
          try {

               // Optimistically update UI first
               setNotifications(prev =>
                    prev.map(notification =>
                         notification.id === notificationId
                              ? { ...notification, read: true }
                              : notification
                    )
               )

               // Then persist to backend
               const result = await markNotificationAsRead(notificationId)
               if (!result.success) {
                    console.error('Failed to mark notification as read:', result.error)
                    // Revert optimistic update on failure
                    setNotifications(prev =>
                         prev.map(notification =>
                              notification.id === notificationId
                                   ? { ...notification, read: false }
                                   : notification
                         )
                    )
               } else {
                 }
          } catch (error) {
               console.error('Error marking notification as read:', error)
               // Revert optimistic update on error
               setNotifications(prev =>
                    prev.map(notification =>
                         notification.id === notificationId
                              ? { ...notification, read: false }
                              : notification
                    )
               )
          }
     }, [])

     // Remove notification
     const removeNotification = useCallback(async (notificationId) => {
          try {

               const result = await deleteNotification(notificationId)
               if (result.success) {
                    setNotifications(prev =>
                         prev.filter(notification => notification.id !== notificationId)
                    )

               } else {
                    console.error('Failed to delete notification:', result.error)
               }
          } catch (error) {
               console.error('Error removing notification:', error)
          }
     }, [])

     // Mark all notifications as read
     const markAllAsRead = useCallback(async () => {
          try {
               const result = await markAllNotificationsAsRead()
               if (result.success) {
                    // Refresh notifications to get updated read status
                    await fetchNotifications()
               } else {
                    console.error('Failed to mark all as read:', result.error)
               }
          } catch (error) {
               console.error('Error marking all as read:', error)
          }
     }, [fetchNotifications])

     // Clear all notifications
     const clearAll = useCallback(async () => {
          try {
               const result = await clearAllNotifications()
               if (result.success) {
                    setNotifications([])
               } else {
                    console.error('Failed to clear all notifications:', result.error)
               }
          } catch (error) {
               console.error('Error clearing all notifications:', error)
          }
     }, [])

     // Auto-fetch notifications when session becomes available
     useEffect(() => {
          fetchNotifications()
     }, [fetchNotifications])

     // Calculate derived state
     const notificationCount = notifications.filter(notification => !notification.read).length
     const readAll = notifications.every(notification => notification.read)

     return {
          notifications,
          loading,
          notificationCount,
          readAll,
          fetchNotifications,
          markAsRead,
          removeNotification,
          markAllAsRead,
          clearAll
     }
}
