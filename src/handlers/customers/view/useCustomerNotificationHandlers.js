import { useState, useCallback, useEffect } from 'react'

/**
 * Customer notification handler for managing notification preferences
 */
export const useCustomerNotificationHandlers = ({ customer, onError, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      orderConfirmations: true,
      orderStatusUpdates: true,
      paymentReminders: false,
      marketingEmails: false,
      securityAlerts: true
    },
    sms: {
      orderConfirmations: false,
      deliveryUpdates: false,
      securityAlerts: true
    },
    push: {
      orderUpdates: true,
      promotionalOffers: false,
      appUpdates: true
    }
  })

  // Initialize notification settings from customer data
  useEffect(() => {
    if (customer?.notificationSettings) {
      setNotificationSettings(prev => ({
        ...prev,
        ...customer.notificationSettings
      }))
    }
  }, [customer])

  // Handle notification setting change
  const handleNotificationChange = useCallback((category, setting, enabled) => {
    setNotificationSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: enabled
      }
    }))
  }, [])

  // Handle save notification preferences
  const handleSavePreferences = useCallback(async () => {
    if (!customer?._id) {
      onError('Customer ID is required')
      return
    }

    setLoading(true)

    try {
      // TODO: Implement save notification preferences API call
      // const result = await updateCustomerNotificationSettings({
      //   customerId: customer._id,
      //   notificationSettings
      // })

      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000))

      onSuccess('Notification preferences saved successfully')
    } catch (error) {
      console.error('Error saving notification preferences:', error)
      onError(error.message || 'Failed to save notification preferences')
    } finally {
      setLoading(false)
    }
  }, [customer, notificationSettings, onError, onSuccess])

  // Handle reset to default
  const handleResetToDefault = useCallback(() => {
    setNotificationSettings({
      email: {
        orderConfirmations: true,
        orderStatusUpdates: true,
        paymentReminders: false,
        marketingEmails: false,
        securityAlerts: true
      },
      sms: {
        orderConfirmations: false,
        deliveryUpdates: false,
        securityAlerts: true
      },
      push: {
        orderUpdates: true,
        promotionalOffers: false,
        appUpdates: true
      }
    })
    
    onSuccess('Notification preferences reset to default')
  }, [onSuccess])

  // Bulk enable/disable for a category
  const handleBulkToggle = useCallback((category, enabled) => {
    setNotificationSettings(prev => {
      const categorySettings = prev[category]
      const updatedSettings = {}
      
      Object.keys(categorySettings).forEach(setting => {
        updatedSettings[setting] = enabled
      })
      
      return {
        ...prev,
        [category]: updatedSettings
      }
    })
  }, [])

  return {
    // State
    loading,
    notificationSettings,
    
    // Actions
    handleNotificationChange,
    handleSavePreferences,
    handleResetToDefault,
    handleBulkToggle
  }
} 