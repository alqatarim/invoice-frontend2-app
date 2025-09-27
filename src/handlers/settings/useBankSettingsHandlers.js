import { useState } from 'react'
import * as bankSettingsActions from '@/app/(dashboard)/settings/actions'

/**
 * Bank Settings Handlers Hook
 * For CRUD operations on bank accounts
 */
export const useBankSettingsHandlers = (initialData = {}) => {
  const [state, setState] = useState({
    banks: initialData.banks || [],
    pagination: initialData.pagination || { page: 0, totalCount: 0, limit: 10 },
    loading: false,
    deleting: false,
    error: null,
    selectedBank: null
  })

  const dataHandlers = {
    async loadBanks() {
      setState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const result = await bankSettingsActions.getInitialBankSettingsData()
        if (result.success) {
          setState(prev => ({
            ...prev,
            banks: result.data?.data || [],
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

    async loadBankById(id) {
      setState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const result = await bankSettingsActions.getBankById(id)
        if (result.success) {
          setState(prev => ({
            ...prev,
            selectedBank: result.data,
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
    async addBank(formData) {
      setState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const result = await bankSettingsActions.addBankSettings(formData)
        if (result.success) {
          setState(prev => ({
            ...prev,
            banks: [...prev.banks, result.data],
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

    async updateBank(id, formData) {
      setState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const result = await bankSettingsActions.updateBankSettings(id, formData)
        if (result.success) {
          setState(prev => ({
            ...prev,
            banks: prev.banks.map(bank =>
              bank._id === id ? result.data : bank
            ),
            selectedBank: result.data,
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

    async deleteBanks(ids) {
      setState(prev => ({ ...prev, deleting: true, error: null }))
      try {
        const result = await bankSettingsActions.deleteBankSettings(ids)
        if (result.success) {
          setState(prev => ({
            ...prev,
            banks: prev.banks.filter(bank => !ids.includes(bank._id)),
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

    clearSelectedBank() {
      setState(prev => ({ ...prev, selectedBank: null }))
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