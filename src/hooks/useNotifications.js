'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from '@/Auth/SessionContext'
import {
     getNotifications,
     getUnreadNotificationCount,
     deleteNotification,
     clearAllNotifications,
     markAllNotificationsAsRead,
     markNotificationAsRead
} from '@/app/actions/notifications'

const INITIAL_UNREAD_COUNT_DELAY_MS = 1500
const NOTIFICATION_CACHE_TTL_MS = 60 * 1000

let listCache = {
     token: '',
     data: [],
     fetchedAt: 0,
     loaded: false
}

let unreadCountCache = {
     token: '',
     count: 0,
     fetchedAt: 0
}

let listRequest = null
let countRequest = null

const isFreshCache = (cache, token) =>
     cache.token === token && Date.now() - cache.fetchedAt < NOTIFICATION_CACHE_TTL_MS

const getUnreadCountFromList = notifications =>
     notifications.filter(notification => !notification.read).length

const updateListCache = (token, data) => {
     const nextData = Array.isArray(data) ? data : []

     listCache = {
          token,
          data: nextData,
          fetchedAt: Date.now(),
          loaded: true
     }

     unreadCountCache = {
          token,
          count: getUnreadCountFromList(nextData),
          fetchedAt: Date.now()
     }

     return nextData
}

export const useNotifications = () => {
     const [notifications, setNotifications] = useState([])
     const [unreadCount, setUnreadCount] = useState(0)
     const [listLoading, setListLoading] = useState(false)
     const [countLoading, setCountLoading] = useState(false)
     const [hasLoadedNotifications, setHasLoadedNotifications] = useState(false)
     const { data: session, status } = useSession()
     const token = session?.user?.token || ''

     const refreshUnreadCountFromList = useCallback(nextNotifications => {
          const nextCount = getUnreadCountFromList(nextNotifications)

          setUnreadCount(nextCount)

          if (token) {
               unreadCountCache = {
                    token,
                    count: nextCount,
                    fetchedAt: Date.now()
               }
          }

          return nextCount
     }, [token])

     const fetchUnreadCount = useCallback(async ({ force = false } = {}) => {
          if (status !== 'authenticated' || !token) return 0

          if (!force && isFreshCache(unreadCountCache, token)) {
               setUnreadCount(unreadCountCache.count)
               return unreadCountCache.count
          }

          setCountLoading(true)

          try {
               if (!countRequest) {
                    countRequest = getUnreadNotificationCount().finally(() => {
                         countRequest = null
                    })
               }

               const result = await countRequest

               if (result.success) {
                    const nextCount = Number(result.count || 0)

                    unreadCountCache = {
                         token,
                         count: nextCount,
                         fetchedAt: Date.now()
                    }

                    setUnreadCount(nextCount)
                    return nextCount
               }

               console.error('Failed to fetch notification count:', result.error)
          } catch (error) {
               console.error('Error fetching notification count:', error)
          } finally {
               setCountLoading(false)
          }

          return 0
     }, [status, token])

     const fetchNotifications = useCallback(async ({ force = false } = {}) => {
          if (status !== 'authenticated' || !token) return []

          if (!force && listCache.loaded && isFreshCache(listCache, token)) {
               setNotifications(listCache.data)
               setHasLoadedNotifications(true)
               refreshUnreadCountFromList(listCache.data)
               return listCache.data
          }

          setListLoading(true)

          try {
               if (!listRequest) {
                    listRequest = getNotifications()
                         .finally(() => {
                              listRequest = null
                         })
               }

               const result = await listRequest

               if (result.success) {
                    const nextNotifications = updateListCache(token, result.data)

                    setNotifications(nextNotifications)
                    setHasLoadedNotifications(true)
                    setUnreadCount(unreadCountCache.count)

                    return nextNotifications
               }

               console.error('Failed to fetch notifications:', result.error)
          } catch (error) {
               console.error('Error fetching notifications:', error)
          } finally {
               setListLoading(false)
          }

          return []
     }, [refreshUnreadCountFromList, status, token])

     const markAsRead = useCallback(async (notificationId) => {
          if (!notificationId) return

          const previousNotifications = notifications

          const markNotificationRead = list =>
               list.map(notification =>
                    notification.id === notificationId
                         ? { ...notification, read: true }
                         : notification
               )

          const nextNotifications = markNotificationRead(notifications)

          setNotifications(nextNotifications)
          refreshUnreadCountFromList(nextNotifications)

          if (listCache.loaded && listCache.token === token) {
               updateListCache(token, markNotificationRead(listCache.data))
          }

          try {
               const result = await markNotificationAsRead(notificationId)

               if (!result.success) {
                    console.error('Failed to mark notification as read:', result.error)
                    setNotifications(previousNotifications)
                    refreshUnreadCountFromList(previousNotifications)
               }
          } catch (error) {
               console.error('Error marking notification as read:', error)
               setNotifications(previousNotifications)
               refreshUnreadCountFromList(previousNotifications)
          }
     }, [notifications, refreshUnreadCountFromList, token])

     const removeNotification = useCallback(async (notificationId) => {
          if (!notificationId) return

          const previousNotifications = notifications
          const removeFromList = list => list.filter(notification => notification.id !== notificationId)
          const nextNotifications = removeFromList(notifications)

          setNotifications(nextNotifications)
          refreshUnreadCountFromList(nextNotifications)

          if (listCache.loaded && listCache.token === token) {
               updateListCache(token, removeFromList(listCache.data))
          }

          try {
               const result = await deleteNotification(notificationId)

               if (!result.success) {
                    console.error('Failed to delete notification:', result.error)
                    setNotifications(previousNotifications)
                    refreshUnreadCountFromList(previousNotifications)
               }
          } catch (error) {
               console.error('Error removing notification:', error)
               setNotifications(previousNotifications)
               refreshUnreadCountFromList(previousNotifications)
          }
     }, [notifications, refreshUnreadCountFromList, token])

     const markAllAsRead = useCallback(async () => {
          const previousNotifications = notifications
          const nextNotifications = notifications.map(notification => ({ ...notification, read: true }))

          setNotifications(nextNotifications)
          refreshUnreadCountFromList(nextNotifications)

          if (listCache.loaded && listCache.token === token) {
               updateListCache(token, nextNotifications)
          }

          try {
               const result = await markAllNotificationsAsRead()

               if (!result.success) {
                    console.error('Failed to mark all as read:', result.error)
                    setNotifications(previousNotifications)
                    refreshUnreadCountFromList(previousNotifications)
               }
          } catch (error) {
               console.error('Error marking all as read:', error)
               setNotifications(previousNotifications)
               refreshUnreadCountFromList(previousNotifications)
          }
     }, [notifications, refreshUnreadCountFromList, token])

     const clearAll = useCallback(async () => {
          const previousNotifications = notifications

          setNotifications([])
          refreshUnreadCountFromList([])

          if (listCache.token === token) {
               updateListCache(token, [])
          }

          try {
               const result = await clearAllNotifications()

               if (!result.success) {
                    console.error('Failed to clear all notifications:', result.error)
                    setNotifications(previousNotifications)
                    refreshUnreadCountFromList(previousNotifications)
               }
          } catch (error) {
               console.error('Error clearing all notifications:', error)
               setNotifications(previousNotifications)
               refreshUnreadCountFromList(previousNotifications)
          }
     }, [notifications, refreshUnreadCountFromList, token])

     useEffect(() => {
          if (status !== 'authenticated' || !token) return undefined

          if (isFreshCache(unreadCountCache, token)) {
               setUnreadCount(unreadCountCache.count)
               return undefined
          }

          const fetchCount = () => fetchUnreadCount()
          const idleCallback =
               typeof window !== 'undefined' && window.requestIdleCallback
                    ? window.requestIdleCallback(fetchCount, { timeout: INITIAL_UNREAD_COUNT_DELAY_MS })
                    : null
          const timer =
               idleCallback === null
                    ? setTimeout(fetchCount, INITIAL_UNREAD_COUNT_DELAY_MS)
                    : null

          return () => {
               if (idleCallback !== null && window.cancelIdleCallback) {
                    window.cancelIdleCallback(idleCallback)
               }

               if (timer !== null) {
                    clearTimeout(timer)
               }
          }
     }, [fetchUnreadCount, status, token])

     const readAll = notifications.every(notification => notification.read)

     return {
          notifications,
          loading: listLoading,
          countLoading,
          notificationCount: unreadCount,
          readAll,
          hasLoadedNotifications,
          fetchUnreadCount,
          fetchNotifications,
          markAsRead,
          removeNotification,
          markAllAsRead,
          clearAll
     }
}
