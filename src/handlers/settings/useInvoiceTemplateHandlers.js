import { useState } from 'react'
import * as invoiceTemplatesActions from '@/app/(dashboard)/settings/actions'

/**
 * Invoice Template Handlers Hook
 * For managing invoice template selection
 */
export const useInvoiceTemplateHandlers = (initialData = {}) => {
  const [state, setState] = useState({
    templates: initialData.templates || [],
    defaultTemplate: initialData.defaultTemplate || null,
    loading: false,
    updating: false,
    error: null
  })

  const templateHandlers = {
    async loadDefaultTemplate() {
      setState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const result = await invoiceTemplatesActions.getDefaultInvoiceTemplate()
        if (result.success) {
          setState(prev => ({
            ...prev,
            defaultTemplate: result.data,
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

    async updateDefaultTemplate(templateId) {
      setState(prev => ({ ...prev, updating: true, error: null }))
      try {
        const result = await invoiceTemplatesActions.updateDefaultInvoiceTemplate(templateId)
        if (result.success) {
          setState(prev => ({
            ...prev,
            defaultTemplate: result.data,
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

    clearError() {
      setState(prev => ({ ...prev, error: null }))
    }
  }

  return {
    state,
    setState,
    templateHandlers
  }
}