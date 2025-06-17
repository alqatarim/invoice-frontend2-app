import { useState } from 'react'
import * as taxSettingsActions from '@/app/(dashboard)/settings/tax-settings/actions'

/**
 * Tax Settings Handlers Hook
 * For CRUD operations on tax rates
 */
export const useTaxSettingsHandlers = (initialData = {}) => {
  const [state, setState] = useState({
    taxes: initialData.taxes || [],
    pagination: initialData.pagination || { page: 0, totalCount: 0, limit: 10 },
    loading: false,
    deleting: false,
    error: null,
    selectedTax: null
  })

  const dataHandlers = {
    async loadTaxes() {
      setState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const result = await taxSettingsActions.getInitialTaxSettingsData()
        if (result.success) {
          setState(prev => ({ 
            ...prev, 
            taxes: result.data?.data || [],
            pagination: {
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

    async loadTaxById(id) {
      setState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const result = await taxSettingsActions.getTaxById(id)
        if (result.success) {
          setState(prev => ({ 
            ...prev, 
            selectedTax: result.data,
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
    }
  }

  const actionHandlers = {
    async addTax(formData) {
      setState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const result = await taxSettingsActions.addTaxSettings(formData)
        if (result.success) {
          setState(prev => ({ 
            ...prev, 
            taxes: [...prev.taxes, result.data],
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

    async updateTax(id, formData) {
      setState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const result = await taxSettingsActions.updateTaxSettings(id, formData)
        if (result.success) {
          setState(prev => ({ 
            ...prev, 
            taxes: prev.taxes.map(tax => 
              tax._id === id ? result.data : tax
            ),
            selectedTax: result.data,
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

    async deleteTaxes(ids) {
      setState(prev => ({ ...prev, deleting: true, error: null }))
      try {
        const result = await taxSettingsActions.deleteTaxSettings(ids)
        if (result.success) {
          setState(prev => ({ 
            ...prev, 
            taxes: prev.taxes.filter(tax => !ids.includes(tax._id)),
            deleting: false 
          }))
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

    clearSelectedTax() {
      setState(prev => ({ ...prev, selectedTax: null }))
    },

    clearError() {
      setState(prev => ({ ...prev, error: null }))
    }
  }

  return {
    state,
    setState,
    dataHandlers,
    actionHandlers
  }
}