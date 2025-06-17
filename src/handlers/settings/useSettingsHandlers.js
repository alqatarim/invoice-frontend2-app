import { useState, useCallback } from 'react'
import * as accountActions from '@/app/(dashboard)/settings/account-settings/actions'
import * as companyActions from '@/app/(dashboard)/settings/company-settings/actions'
import * as passwordActions from '@/app/(dashboard)/settings/change-password/actions'
import * as invoiceSettingsActions from '@/app/(dashboard)/settings/invoice-settings/actions'
import * as emailSettingsActions from '@/app/(dashboard)/settings/email-settings/actions'
import * as notificationSettingsActions from '@/app/(dashboard)/settings/notification-settings/actions'
import * as paymentSettingsActions from '@/app/(dashboard)/settings/payment-settings/actions'
import * as preferenceSettingsActions from '@/app/(dashboard)/settings/preference-settings/actions'
import * as taxSettingsActions from '@/app/(dashboard)/settings/tax-settings/actions'
import * as bankSettingsActions from '@/app/(dashboard)/settings/bank-settings/actions'

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
        const result = await accountActions.updateAccountSettings(formData)
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
        const result = await companyActions.getCompanySettings()
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
        const result = await companyActions.updateCompanySettings(formData)
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
        const result = await passwordActions.changePassword(formData)
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
        const result = await invoiceSettingsActions.getInvoiceSettings()
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
        const result = await invoiceSettingsActions.updateInvoiceSettings(formData)
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
        const result = await paymentSettingsActions.getPaymentSettings()
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
        const result = await paymentSettingsActions.updatePaymentSettings(formData)
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
        const result = await preferenceSettingsActions.getPreferenceSettings()
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
        const result = await preferenceSettingsActions.updatePreferenceSettings(formData)
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
        const result = await preferenceSettingsActions.getCurrencies()
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
        const result = await emailSettingsActions.getEmailSettings()
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
        const result = await emailSettingsActions.updateEmailSettings(formData)
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
        const result = await notificationSettingsActions.getNotificationSettings()
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
        const result = await notificationSettingsActions.updateNotificationSettings(formData)
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
        const result = await taxSettingsActions.getTaxSettings()
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
        const result = await taxSettingsActions.addTaxSettings(formData)
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
        const result = await taxSettingsActions.updateTaxSettings(id, formData)
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
        const result = await taxSettingsActions.deleteTaxSettings(ids)
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
        const result = await taxSettingsActions.getTaxById(id)
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
        const result = await bankSettingsActions.getBankSettings()
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
        const result = await bankSettingsActions.addBankSettings(formData)
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
        const result = await bankSettingsActions.updateBankSettings(id, formData)
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
        const result = await bankSettingsActions.deleteBankSettings(ids)
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
        const result = await bankSettingsActions.getBankById(id)
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