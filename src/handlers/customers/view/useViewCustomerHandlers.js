import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { deleteCustomer } from '@/app/(dashboard)/customers/actions'
import { useCustomerDetailsHandlers } from './useCustomerDetailsHandlers'
import { useCustomerAddressHandlers } from './useCustomerAddressHandlers'
import { useCustomerSecurityHandlers } from './useCustomerSecurityHandlers'
import { useCustomerNotificationHandlers } from './useCustomerNotificationHandlers'

/**
 * Main composite hook for view customer functionality
 * Combines all modular handlers following single responsibility principle
 */
export const useViewCustomerHandlers = ({ customer, onError, onSuccess, onCustomerUpdate }) => {
  const router = useRouter()
  const [generalLoading, setGeneralLoading] = useState(false)

  // Customer details handler - manages basic customer information
  const detailsHandler = useCustomerDetailsHandlers({
    customer,
    onError,
    onSuccess,
    onUpdate: onCustomerUpdate
  })

  // Address and billing handler - manages addresses and payment info
  const addressHandler = useCustomerAddressHandlers({
    customer,
    onError,
    onSuccess,
    onUpdate: onCustomerUpdate
  })

  // Security handler - manages password and 2FA settings
  const securityHandler = useCustomerSecurityHandlers({
    customer,
    onError,
    onSuccess
  })

  // Notification handler - manages notification preferences
  const notificationHandler = useCustomerNotificationHandlers({
    customer,
    onError,
    onSuccess
  })

  // Handle customer deletion
  const handleDeleteCustomer = useCallback(async () => {
    if (!customer?._id) {
      onError('Customer ID is required for deletion')
      return
    }

    setGeneralLoading(true)

    try {
      const result = await deleteCustomer(customer._id)
      
      if (result.success) {
        onSuccess('Customer deleted successfully')
        
        // Navigate to customer list after deletion
        setTimeout(() => {
          router.push('/customers/customer-list')
        }, 1000)
      } else {
        onError(result.error || 'Failed to delete customer')
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      onError(error.message || 'An error occurred while deleting the customer')
    } finally {
      setGeneralLoading(false)
    }
  }, [customer, onError, onSuccess, router])

  // Handle navigation back
  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  // Handle navigation to invoice creation
  const handleCreateInvoice = useCallback(() => {
    if (customer?._id) {
      router.push(`/invoices/add?customerId=${customer._id}`)
    }
  }, [customer, router])

  // Handle navigation to customer list
  const handleViewAllInvoices = useCallback(() => {
    router.push(`/invoices/invoice-list?customerId=${customer._id}`)
  }, [customer, router])

  return {
    // General state
    generalLoading,

    // Customer details handlers
    detailsHandlers: {
      loading: detailsHandler.loading,
      handleUpdateCustomerDetails: detailsHandler.handleUpdateCustomerDetails,
      handleImageUpdate: detailsHandler.handleImageUpdate,
      handleStatusChange: detailsHandler.handleStatusChange
    },

    // Address and billing handlers
    addressHandlers: {
      editMode: addressHandler.editMode,
      formData: addressHandler.formData,
      loading: addressHandler.loading,
      handleEditModeToggle: addressHandler.handleEditModeToggle,
      handleFieldChange: addressHandler.handleFieldChange,
      handleSaveSection: addressHandler.handleSaveSection,
      handleCancelEdit: addressHandler.handleCancelEdit,
      handleCopyBillingToShipping: addressHandler.handleCopyBillingToShipping,
      initializeFormData: addressHandler.initializeFormData
    },

    // Security handlers
    securityHandlers: {
      loading: securityHandler.loading,
      showPassword: securityHandler.showPassword,
      passwordForm: securityHandler.passwordForm,
      twoFactorSettings: securityHandler.twoFactorSettings,
      handlePasswordFieldChange: securityHandler.handlePasswordFieldChange,
      handlePasswordVisibilityToggle: securityHandler.handlePasswordVisibilityToggle,
      handleChangePassword: securityHandler.handleChangePassword,
      handleCancelPasswordChange: securityHandler.handleCancelPasswordChange,
      handle2FAToggle: securityHandler.handle2FAToggle,
      validatePasswordForm: securityHandler.validatePasswordForm
    },

    // Notification handlers
    notificationHandlers: {
      loading: notificationHandler.loading,
      notificationSettings: notificationHandler.notificationSettings,
      handleNotificationChange: notificationHandler.handleNotificationChange,
      handleSavePreferences: notificationHandler.handleSavePreferences,
      handleResetToDefault: notificationHandler.handleResetToDefault,
      handleBulkToggle: notificationHandler.handleBulkToggle
    },

    // General actions
    handleDeleteCustomer,
    handleBack,
    handleCreateInvoice,
    handleViewAllInvoices
  }
} 