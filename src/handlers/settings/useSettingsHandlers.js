import { useState, useCallback } from 'react'
import * as settingsActions from '@/app/(dashboard)/settings/actions'

/**
 * Settings Handlers Hook
 * Follows the vendor pattern for simple, maintainable handlers
 */
export const useSettingsHandlers = (initialData = {}) => {
  const [state, setState] = useState({
    loading: false,
    updating: false,
    error: null,
    ...initialData
  })

  // Account Settings Handlers
  const accountHandlers = {
    async loadAccountSettings() {
      setState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const result = await accountActions.getAccountSettings()
        if (result.success) {
          setState(prev => ({
            ...prev,
            accountSettings: result.data,
            loading: false
          }))
          return result
        }
        throw new Error(result.message)
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }))
        return { success: false, message: error.message }
      }
    },

    async updateAccountSettings(formData) {
      setState(prev => ({ ...prev, updating: true, error: null }))
      try {
        const result = await settingsActions.updateAccountSettings(formData)
        if (result.success) {
          setState(prev => ({
            ...prev,
            accountSettings: result.data,
            updating: false
          }))
          return result
        }
        throw new Error(result.message)
      } catch (error) {
        setState(prev => ({
          ...prev,
          updating: false,
          error: error.message
        }))
        return { success: false, message: error.message }
      }
    }
  }

  // Company Settings Handlers
  const companyHandlers = {
    async loadCompanySettings() {
      setState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const result = await settingsActions.getCompanySettings()
        if (result.success) {
          setState(prev => ({
            ...prev,
            companySettings: result.data,
            loading: false
          }))
          return result
        }
        throw new Error(result.message)
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }))
        return { success: false, message: error.message }
      }
    },

    async updateCompanySettings(formData) {
      setState(prev => ({ ...prev, updating: true, error: null }))
      try {
        const result = await settingsActions.updateCompanySettings(formData)
        if (result.success) {
          setState(prev => ({
            ...prev,
            companySettings: result.data,
            updating: false
          }))
          return result
        }
        throw new Error(result.message)
      } catch (error) {
        setState(prev => ({
          ...prev,
          updating: false,
          error: error.message
        }))
        return { success: false, message: error.message }
      }
    }
  }

  // Password Change Handlers
  const passwordHandlers = {
    async changePassword(formData) {
      setState(prev => ({ ...prev, updating: true, error: null }))
      try {
        const result = await settingsActions.changePassword(formData)
        setState(prev => ({ ...prev, updating: false }))
        return result
      } catch (error) {
        setState(prev => ({
          ...prev,
          updating: false,
          error: error.message
        }))
        return { success: false, message: error.message }
      }
    }
  }

  // Invoice Settings Handlers
  const invoiceSettingsHandlers = {
    async loadInvoiceSettings() {
      setState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const result = await settingsActions.getInvoiceSettings()
        if (result.success) {
          setState(prev => ({
            ...prev,
            invoiceSettings: result.data,
            loading: false
          }))
          return result
        }
        throw new Error(result.message)
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }))
        return { success: false, message: error.message }
      }
    },

    async updateInvoiceSettings(formData) {
      setState(prev => ({ ...prev, updating: true, error: null }))
      try {
        const result = await settingsActions.updateInvoiceSettings(formData)
        if (result.success) {
          setState(prev => ({
            ...prev,
            invoiceSettings: result.data,
            updating: false
          }))
          return result
        }
        throw new Error(result.message)
      } catch (error) {
        setState(prev => ({
          ...prev,
          updating: false,
          error: error.message
        }))
        return { success: false, message: error.message }
      }
    }
  }

  // Payment Settings Handlers
  const paymentSettingsHandlers = {
    async loadPaymentSettings() {
      setState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const result = await settingsActions.getPaymentSettings()
        if (result.success) {
          setState(prev => ({
            ...prev,
            paymentSettings: result.data,
            loading: false
          }))
          return result
        }
        throw new Error(result.message)
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }))
        return { success: false, message: error.message }
      }
    },

    async updatePaymentSettings(formData) {
      setState(prev => ({ ...prev, updating: true, error: null }))
      try {
        const result = await settingsActions.updatePaymentSettings(formData)
        if (result.success) {
          setState(prev => ({
            ...prev,
            paymentSettings: result.data,
            updating: false
          }))
          return result
        }
        throw new Error(result.message)
      } catch (error) {
        setState(prev => ({
          ...prev,
          updating: false,
          error: error.message
        }))
        return { success: false, message: error.message }
      }
    }
  }

  // Preference Settings Handlers
  const preferenceHandlers = {
    async loadPreferenceSettings() {
      setState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const result = await settingsActions.getPreferenceSettings()
        if (result.success) {
          setState(prev => ({
            ...prev,
            preferenceSettings: result.data,
            loading: false
          }))
          return result
        }
        throw new Error(result.message)
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }))
        return { success: false, message: error.message }
      }
    },

    async updatePreferenceSettings(formData) {
      setState(prev => ({ ...prev, updating: true, error: null }))
      try {
        const result = await settingsActions.updatePreferenceSettings(formData)
        if (result.success) {
          setState(prev => ({
            ...prev,
            preferenceSettings: result.data,
            updating: false
          }))
          return result
        }
        throw new Error(result.message)
      } catch (error) {
        setState(prev => ({
          ...prev,
          updating: false,
          error: error.message
        }))
        return { success: false, message: error.message }
      }
    },

    loadCurrencies: useCallback(async () => {
      setState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const result = await settingsActions.getCurrencies()
        if (result.success) {
          setState(prev => ({
            ...prev,
            currencies: result.data,
            loading: false
          }))
          return result
        }
        throw new Error(result.message)
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }))
        return { success: false, message: error.message }
      }
    }, [])
  }

  // Email Settings Handlers
  const emailSettingsHandlers = {
    async loadEmailSettings() {
      setState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const result = await settingsActions.getEmailSettings()
        if (result.success) {
          setState(prev => ({
            ...prev,
            emailSettings: result.data,
            loading: false
          }))
          return result
        }
        throw new Error(result.message)
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }))
        return { success: false, message: error.message }
      }
    },

    async updateEmailSettings(formData) {
      setState(prev => ({ ...prev, updating: true, error: null }))
      try {
        const result = await settingsActions.updateEmailSettings(formData)
        if (result.success) {
          setState(prev => ({
            ...prev,
            emailSettings: result.data,
            updating: false
          }))
          return result
        }
        throw new Error(result.message)
      } catch (error) {
        setState(prev => ({
          ...prev,
          updating: false,
          error: error.message
        }))
        return { success: false, message: error.message }
      }
    }
  }

  // Notification Settings Handlers
  const notificationHandlers = {
    async loadNotificationSettings() {
      setState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const result = await settingsActions.getNotificationSettings()
        if (result.success) {
          setState(prev => ({
            ...prev,
            notificationSettings: result.data,
            loading: false
          }))
          return result
        }
        throw new Error(result.message)
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }))
        return { success: false, message: error.message }
      }
    },

    async updateNotificationSettings(formData) {
      setState(prev => ({ ...prev, updating: true, error: null }))
      try {
        const result = await settingsActions.updateNotificationSettings(formData)
        if (result.success) {
          setState(prev => ({
            ...prev,
            notificationSettings: result.data,
            updating: false
          }))
          return result
        }
        throw new Error(result.message)
      } catch (error) {
        setState(prev => ({
          ...prev,
          updating: false,
          error: error.message
        }))
        return { success: false, message: error.message }
      }
    }
  }

  // Tax Settings Handlers (CRUD operations)
  const taxHandlers = {
    async loadTaxes() {
      setState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const result = await settingsActions.getTaxSettings()
        if (result.success) {
          setState(prev => ({
            ...prev,
            taxes: result.data?.data || [],
            taxPagination: {
              page: 0,
              totalCount: result.data?.totalCount || 0,
              limit: 10
            },
            loading: false
          }))
          return result
        }
        throw new Error(result.message)
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }))
        return { success: false, message: error.message }
      }
    },

    async addTax(formData) {
      setState(prev => ({ ...prev, updating: true, error: null }))
      try {
        const result = await settingsActions.addTaxSettings(formData)
        if (result.success) {
          // Reload taxes after adding
          await this.loadTaxes()
          setState(prev => ({ ...prev, updating: false }))
          return result
        }
        throw new Error(result.message)
      } catch (error) {
        setState(prev => ({
          ...prev,
          updating: false,
          error: error.message
        }))
        return { success: false, message: error.message }
      }
    },

    async updateTax(id, formData) {
      setState(prev => ({ ...prev, updating: true, error: null }))
      try {
        const result = await settingsActions.updateTaxSettings(id, formData)
        if (result.success) {
          // Reload taxes after updating
          await this.loadTaxes()
          setState(prev => ({ ...prev, updating: false }))
          return result
        }
        throw new Error(result.message)
      } catch (error) {
        setState(prev => ({
          ...prev,
          updating: false,
          error: error.message
        }))
        return { success: false, message: error.message }
      }
    },

    async deleteTax(ids) {
      setState(prev => ({ ...prev, deleting: true, error: null }))
      try {
        const result = await settingsActions.deleteTaxSettings(ids)
        if (result.success) {
          // Reload taxes after deleting
          await this.loadTaxes()
          setState(prev => ({ ...prev, deleting: false }))
          return result
        }
        throw new Error(result.message)
      } catch (error) {
        setState(prev => ({
          ...prev,
          deleting: false,
          error: error.message
        }))
        return { success: false, message: error.message }
      }
    },

    async getTaxById(id) {
      setState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const result = await settingsActions.getTaxById(id)
        if (result.success) {
          setState(prev => ({
            ...prev,
            currentTax: result.data,
            loading: false
          }))
          return result
        }
        throw new Error(result.message)
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }))
        return { success: false, message: error.message }
      }
    },

    clearError() {
      setState(prev => ({ ...prev, error: null }))
    }
  }

  // Bank Settings Handlers (CRUD operations)
  const bankHandlers = {
    async loadBanks() {
      setState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const result = await settingsActions.getBankSettings()
        if (result.success) {
          setState(prev => ({
            ...prev,
            banks: result.data?.data || [],
            bankPagination: {
              page: 0,
              totalCount: result.data?.totalCount || 0,
              limit: 10
            },
            loading: false
          }))
          return result
        }
        throw new Error(result.message)
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }))
        return { success: false, message: error.message }
      }
    },

    async addBank(formData) {
      setState(prev => ({ ...prev, updating: true, error: null }))
      try {
        const result = await settingsActions.addBankSettings(formData)
        if (result.success) {
          await this.loadBanks()
          setState(prev => ({ ...prev, updating: false }))
          return result
        }
        throw new Error(result.message)
      } catch (error) {
        setState(prev => ({
          ...prev,
          updating: false,
          error: error.message
        }))
        return { success: false, message: error.message }
      }
    },

    async updateBank(id, formData) {
      setState(prev => ({ ...prev, updating: true, error: null }))
      try {
        const result = await settingsActions.updateBankSettings(id, formData)
        if (result.success) {
          await this.loadBanks()
          setState(prev => ({ ...prev, updating: false }))
          return result
        }
        throw new Error(result.message)
      } catch (error) {
        setState(prev => ({
          ...prev,
          updating: false,
          error: error.message
        }))
        return { success: false, message: error.message }
      }
    },

    async deleteBank(ids) {
      setState(prev => ({ ...prev, deleting: true, error: null }))
      try {
        const result = await settingsActions.deleteBankSettings(ids)
        if (result.success) {
          await this.loadBanks()
          setState(prev => ({ ...prev, deleting: false }))
          return result
        }
        throw new Error(result.message)
      } catch (error) {
        setState(prev => ({
          ...prev,
          deleting: false,
          error: error.message
        }))
        return { success: false, message: error.message }
      }
    },

    async getBankById(id) {
      setState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const result = await settingsActions.getBankById(id)
        if (result.success) {
          setState(prev => ({
            ...prev,
            currentBank: result.data,
            loading: false
          }))
          return result
        }
        throw new Error(result.message)
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }))
        return { success: false, message: error.message }
      }
    },

    clearError() {
      setState(prev => ({ ...prev, error: null }))
    }
  }

  return {
    state,
    setState,
    accountHandlers,
    companyHandlers,
    passwordHandlers,
    invoiceSettingsHandlers,
    paymentSettingsHandlers,
    preferenceHandlers,
    emailSettingsHandlers,
    notificationHandlers,
    taxHandlers,
    bankHandlers
  }
}