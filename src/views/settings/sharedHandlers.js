'use client'

import { useCallback, useState } from 'react'

import * as settingsActions from '@/app/(dashboard)/settings/actions'
import { invoiceTemplateCatalog } from '@/common/invoiceTemplateCatalog'

const DEFAULT_COLLECTION_PAGINATION = {
  page: 0,
  totalCount: 0,
  limit: 10
}

const getErrorMessage = (error, fallbackMessage) => error?.message || fallbackMessage

const normalizeRecord = data =>
  data && typeof data === 'object' && data.updatedData && typeof data.updatedData === 'object'
    ? data.updatedData
    : data

const normalizeCompanySettings = data => {
  if (!data || typeof data !== 'object') {
    return {}
  }

  return normalizeRecord(data) || {}
}

const normalizeCollectionData = data => {
  const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
  const totalCount = typeof data?.totalCount === 'number' ? data.totalCount : items.length

  return { items, totalCount }
}

const normalizeCollectionPagination = (data, fallback = DEFAULT_COLLECTION_PAGINATION) => {
  const { totalCount } = normalizeCollectionData(data)

  return {
    page: 0,
    totalCount,
    limit: fallback?.limit || DEFAULT_COLLECTION_PAGINATION.limit
  }
}

const normalizeIds = ids => {
  if (Array.isArray(ids)) {
    return ids.filter(Boolean)
  }

  return ids ? [ids] : []
}

const getItemId = item => item?._id || item?.id || null

const mergeItemById = (items, nextItem) => {
  const nextId = getItemId(nextItem)

  if (!nextId) {
    return items
  }

  return [nextItem, ...items.filter(item => getItemId(item) !== nextId)]
}

const replaceItemById = (items, nextItem) => {
  const nextId = getItemId(nextItem)

  if (!nextId) {
    return items
  }

  return items.map(item => (getItemId(item) === nextId ? nextItem : item))
}

const normalizeSignatureCollection = data => {
  const { items, totalCount } = normalizeCollectionData(data)

  return {
    signatures: items,
    pagination: {
      current: 1,
      pageSize: 10,
      total: totalCount
    }
  }
}

const useSettingsEntity = ({
  initialValue,
  getAction,
  updateAction,
  fetchErrorMessage,
  updateErrorMessage,
  normalizeData = value => value
}) => {
  const [value, setValue] = useState(normalizeData(initialValue))
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await getAction()

      if (result.success) {
        setValue(normalizeData(result.data))
        return result
      }

      throw new Error(result.message)
    } catch (error) {
      setError(getErrorMessage(error, fetchErrorMessage))
      throw error
    } finally {
      setLoading(false)
    }
  }

  const update = async payload => {
    setUpdating(true)
    setError(null)

    try {
      const result = await updateAction(payload)

      if (result.success) {
        setValue(normalizeData(result.data))
        return result
      }

      throw new Error(result.message)
    } catch (error) {
      setError(getErrorMessage(error, updateErrorMessage))
      throw error
    } finally {
      setUpdating(false)
    }
  }

  return {
    value,
    setValue,
    loading,
    updating,
    error,
    load,
    update,
    clearError: () => setError(null)
  }
}

export const useAccountSettingsHandlers = (initialAccountSettings = null) => {
  const [accountSettings, setAccountSettings] = useState(initialAccountSettings)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)

  const getAccountSettings = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await settingsActions.getAccountSettings()

      if (result.success) {
        setAccountSettings(result.data)
        return result
      }

      throw new Error(result.message)
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to fetch account settings'))
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateAccountSettings = async data => {
    setUpdating(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('firstName', data.firstName)
      formData.append('lastName', data.lastName)
      formData.append('email', data.email)
      formData.append('mobileNumber', data.mobileNumber)
      formData.append('gender', data.gender || '')
      formData.append('DOB', data.DOB || '')

      if (data.image) {
        formData.append('image', data.image)
      }

      const result = await settingsActions.updateAccountSettings(formData)

      if (result.success) {
        const updatedData = result.data?.updatedData || result.data
        setAccountSettings(updatedData)

        if (typeof window !== 'undefined') {
          const profileData = JSON.parse(localStorage.getItem('profileData') || '{}')
          profileData.firstName = updatedData?.firstName
          profileData.lastName = updatedData?.lastName
          profileData.image = updatedData?.image
          localStorage.setItem('profileData', JSON.stringify(profileData))
        }

        return result
      }

      throw new Error(result.message)
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to update account settings'))
      throw error
    } finally {
      setUpdating(false)
    }
  }

  return {
    accountSettings,
    loading,
    updating,
    error,
    getAccountSettings,
    updateAccountSettings,
    clearError: () => setError(null)
  }
}

export const useCompanySettingsHandlers = (initialData = {}) => {
  const entity = useSettingsEntity({
    initialValue: initialData.companySettings,
    getAction: settingsActions.getCompanySettings,
    updateAction: settingsActions.updateCompanySettings,
    fetchErrorMessage: 'Failed to fetch company settings',
    updateErrorMessage: 'Failed to update company settings',
    normalizeData: normalizeCompanySettings
  })

  return {
    companySettings: entity.value,
    loading: entity.loading,
    updating: entity.updating,
    error: entity.error,
    getCompanySettings: entity.load,
    updateCompanySettings: entity.update,
    clearError: entity.clearError
  }
}

export const useChangePasswordHandlers = () => {
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)

  const changePassword = async formData => {
    setUpdating(true)
    setError(null)

    try {
      const result = await settingsActions.changePassword(formData)

      if (result.success) {
        return result
      }

      throw new Error(result.message)
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to change password'))
      throw error
    } finally {
      setUpdating(false)
    }
  }

  return {
    loading,
    updating,
    error,
    changePassword,
    clearError: () => setError(null)
  }
}

export const useInvoiceSettingsHandlers = (initialData = {}) => {
  const entity = useSettingsEntity({
    initialValue: initialData.invoiceSettings || {},
    getAction: settingsActions.getInvoiceSettings,
    updateAction: settingsActions.updateInvoiceSettings,
    fetchErrorMessage: 'Failed to fetch invoice settings',
    updateErrorMessage: 'Failed to update invoice settings'
  })

  return {
    invoiceSettings: entity.value,
    loading: entity.loading,
    updating: entity.updating,
    error: entity.error,
    getInvoiceSettings: entity.load,
    updateInvoiceSettings: entity.update,
    clearError: entity.clearError
  }
}

export const usePaymentSettingsHandlers = (initialData = {}) => {
  const entity = useSettingsEntity({
    initialValue: initialData.paymentSettings || {},
    getAction: settingsActions.getPaymentSettings,
    updateAction: settingsActions.updatePaymentSettings,
    fetchErrorMessage: 'Failed to fetch payment settings',
    updateErrorMessage: 'Failed to update payment settings'
  })

  return {
    paymentSettings: entity.value,
    loading: entity.loading,
    updating: entity.updating,
    error: entity.error,
    getPaymentSettings: entity.load,
    updatePaymentSettings: entity.update,
    clearError: entity.clearError
  }
}

export const usePreferenceSettingsHandlers = (initialData = {}) => {
  const [preferenceSettings, setPreferenceSettings] = useState(initialData.preferenceSettings || {})
  const [currencies, setCurrencies] = useState(initialData.currencies || [])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)

  const getPreferenceSettings = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await settingsActions.getPreferenceSettings()

      if (result.success) {
        setPreferenceSettings(result.data)
        return result
      }

      throw new Error(result.message)
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to fetch preference settings'))
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getCurrencies = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await settingsActions.getCurrencies()

      if (result.success) {
        setCurrencies(result.data)
        return result
      }

      throw new Error(result.message)
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to fetch currencies'))
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updatePreferenceSettings = async formData => {
    setUpdating(true)
    setError(null)

    try {
      const result = await settingsActions.updatePreferenceSettings(formData)

      if (result.success) {
        setPreferenceSettings(result.data)
        return result
      }

      throw new Error(result.message)
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to update preference settings'))
      throw error
    } finally {
      setUpdating(false)
    }
  }

  return {
    preferenceSettings,
    currencies,
    loading,
    updating,
    error,
    getPreferenceSettings,
    getCurrencies,
    updatePreferenceSettings,
    clearError: () => setError(null)
  }
}

export const useEmailSettingsHandlers = (initialData = {}) => {
  const entity = useSettingsEntity({
    initialValue: initialData.emailSettings || {},
    getAction: settingsActions.getEmailSettings,
    updateAction: settingsActions.updateEmailSettings,
    fetchErrorMessage: 'Failed to fetch email settings',
    updateErrorMessage: 'Failed to update email settings'
  })

  return {
    emailSettings: entity.value,
    loading: entity.loading,
    updating: entity.updating,
    error: entity.error,
    getEmailSettings: entity.load,
    updateEmailSettings: entity.update,
    clearError: entity.clearError
  }
}

export const useNotificationSettingsHandlers = (initialData = {}) => {
  const entity = useSettingsEntity({
    initialValue: initialData.notificationSettings || {},
    getAction: settingsActions.getNotificationSettings,
    updateAction: settingsActions.updateNotificationSettings,
    fetchErrorMessage: 'Failed to fetch notification settings',
    updateErrorMessage: 'Failed to update notification settings'
  })

  return {
    notificationSettings: entity.value,
    loading: entity.loading,
    updating: entity.updating,
    error: entity.error,
    getNotificationSettings: entity.load,
    updateNotificationSettings: entity.update,
    clearError: entity.clearError
  }
}

export const useTaxSettingsHandlers = (initialData = {}) => {
  const [state, setState] = useState({
    taxes: Array.isArray(initialData.taxes) ? initialData.taxes : [],
    pagination: initialData.pagination || DEFAULT_COLLECTION_PAGINATION,
    loading: false,
    updating: false,
    deleting: false,
    error: null,
    currentTax: initialData.currentTax || initialData.selectedTax || null,
    selectedTax: initialData.selectedTax || initialData.currentTax || null
  })

  const loadTaxes = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await settingsActions.getInitialTaxSettingsData()

      if (result.success) {
        const { items } = normalizeCollectionData(result.data)

        setState(prev => ({
          ...prev,
          taxes: items,
          pagination: normalizeCollectionPagination(result.data, prev.pagination),
          loading: false
        }))

        return result
      }

      throw new Error(result.message)
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to fetch tax settings')

      setState(prev => ({
        ...prev,
        loading: false,
        error: message
      }))

      return { success: false, message }
    }
  }

  const loadTaxById = async id => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await settingsActions.getTaxById(id)

      if (result.success) {
        const nextTax = normalizeRecord(result.data)

        setState(prev => ({
          ...prev,
          currentTax: nextTax,
          selectedTax: nextTax,
          loading: false
        }))

        return result
      }

      throw new Error(result.message)
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to fetch tax rate')

      setState(prev => ({
        ...prev,
        loading: false,
        error: message
      }))

      return { success: false, message }
    }
  }

  const addTax = async formData => {
    setState(prev => ({ ...prev, updating: true, error: null }))

    try {
      const result = await settingsActions.addTaxSettings(formData)

      if (result.success) {
        const nextTax = normalizeRecord(result.data)

        setState(prev => ({
          ...prev,
          taxes: nextTax ? mergeItemById(prev.taxes, nextTax) : prev.taxes,
          currentTax: nextTax || prev.currentTax,
          selectedTax: nextTax || prev.selectedTax,
          updating: false,
          pagination: {
            ...prev.pagination,
            totalCount: nextTax ? Math.max(prev.pagination?.totalCount || 0, prev.taxes.length + 1) : prev.pagination?.totalCount || 0
          }
        }))

        return result
      }

      throw new Error(result.message)
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to add tax rate')

      setState(prev => ({
        ...prev,
        updating: false,
        error: message
      }))

      return { success: false, message }
    }
  }

  const updateTax = async (id, formData) => {
    setState(prev => ({ ...prev, updating: true, error: null }))

    try {
      const result = await settingsActions.updateTaxSettings(id, formData)

      if (result.success) {
        const nextTax = normalizeRecord(result.data)

        setState(prev => ({
          ...prev,
          taxes: nextTax ? replaceItemById(prev.taxes, nextTax) : prev.taxes,
          currentTax: nextTax || prev.currentTax,
          selectedTax: nextTax || prev.selectedTax,
          updating: false
        }))

        return result
      }

      throw new Error(result.message)
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to update tax rate')

      setState(prev => ({
        ...prev,
        updating: false,
        error: message
      }))

      return { success: false, message }
    }
  }

  const deleteTax = async ids => {
    const normalizedIds = normalizeIds(ids)

    setState(prev => ({ ...prev, deleting: true, error: null }))

    try {
      const result = await settingsActions.deleteTaxSettings(normalizedIds)

      if (result.success) {
        setState(prev => ({
          ...prev,
          taxes: prev.taxes.filter(tax => !normalizedIds.includes(getItemId(tax))),
          deleting: false,
          pagination: {
            ...prev.pagination,
            totalCount: Math.max(0, (prev.pagination?.totalCount || prev.taxes.length) - normalizedIds.length)
          }
        }))

        return result
      }

      throw new Error(result.message)
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to delete tax rate')

      setState(prev => ({
        ...prev,
        deleting: false,
        error: message
      }))

      return { success: false, message }
    }
  }

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }))
  }

  const clearSelectedTax = () => {
    setState(prev => ({
      ...prev,
      currentTax: null,
      selectedTax: null
    }))
  }

  return {
    state,
    setState,
    dataHandlers: {
      loadTaxes,
      loadTaxById
    },
    actionHandlers: {
      addTax,
      updateTax,
      deleteTax,
      getTaxById: loadTaxById,
      clearError,
      clearSelectedTax
    }
  }
}

export const useBankSettingsHandlers = (initialData = {}) => {
  const [state, setState] = useState({
    banks: Array.isArray(initialData.banks) ? initialData.banks : [],
    pagination: initialData.pagination || DEFAULT_COLLECTION_PAGINATION,
    loading: false,
    deleting: false,
    error: null,
    selectedBank: initialData.selectedBank || null
  })

  const loadBanks = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await settingsActions.getInitialBankSettingsData()

      if (result.success) {
        const { items } = normalizeCollectionData(result.data)

        setState(prev => ({
          ...prev,
          banks: items,
          pagination: normalizeCollectionPagination(result.data, prev.pagination),
          loading: false
        }))

        return result
      }

      throw new Error(result.message)
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to fetch bank settings')

      setState(prev => ({
        ...prev,
        loading: false,
        error: message
      }))

      return { success: false, message }
    }
  }

  const loadBankById = async id => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await settingsActions.getBankById(id)

      if (result.success) {
        const nextBank = normalizeRecord(result.data)

        setState(prev => ({
          ...prev,
          selectedBank: nextBank,
          loading: false
        }))

        return result
      }

      throw new Error(result.message)
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to fetch bank account')

      setState(prev => ({
        ...prev,
        loading: false,
        error: message
      }))

      return { success: false, message }
    }
  }

  const addBank = async formData => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await settingsActions.addBankSettings(formData)

      if (result.success) {
        const nextBank = normalizeRecord(result.data)

        setState(prev => ({
          ...prev,
          banks: nextBank ? mergeItemById(prev.banks, nextBank) : prev.banks,
          selectedBank: nextBank || prev.selectedBank,
          loading: false,
          pagination: {
            ...prev.pagination,
            totalCount: nextBank ? Math.max(prev.pagination?.totalCount || 0, prev.banks.length + 1) : prev.pagination?.totalCount || 0
          }
        }))

        return result
      }

      throw new Error(result.message)
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to add bank account')

      setState(prev => ({
        ...prev,
        loading: false,
        error: message
      }))

      return { success: false, message }
    }
  }

  const updateBank = async (id, formData) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await settingsActions.updateBankSettings(id, formData)

      if (result.success) {
        const nextBank = normalizeRecord(result.data)

        setState(prev => ({
          ...prev,
          banks: nextBank ? replaceItemById(prev.banks, nextBank) : prev.banks,
          selectedBank: nextBank || prev.selectedBank,
          loading: false
        }))

        return result
      }

      throw new Error(result.message)
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to update bank account')

      setState(prev => ({
        ...prev,
        loading: false,
        error: message
      }))

      return { success: false, message }
    }
  }

  const deleteBanks = async ids => {
    const normalizedIds = normalizeIds(ids)

    setState(prev => ({ ...prev, deleting: true, error: null }))

    try {
      const result = await settingsActions.deleteBankSettings(normalizedIds)

      if (result.success) {
        setState(prev => ({
          ...prev,
          banks: prev.banks.filter(bank => !normalizedIds.includes(getItemId(bank))),
          deleting: false,
          pagination: {
            ...prev.pagination,
            totalCount: Math.max(0, (prev.pagination?.totalCount || prev.banks.length) - normalizedIds.length)
          }
        }))

        return result
      }

      throw new Error(result.message)
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to delete bank account')

      setState(prev => ({
        ...prev,
        deleting: false,
        error: message
      }))

      return { success: false, message }
    }
  }

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }))
  }

  const clearSelectedBank = () => {
    setState(prev => ({ ...prev, selectedBank: null }))
  }

  return {
    state,
    setState,
    dataHandlers: {
      loadBanks,
      loadBankById
    },
    actionHandlers: {
      addBank,
      updateBank,
      deleteBanks,
      clearError,
      clearSelectedBank
    }
  }
}

export const useInvoiceTemplateHandlers = (initialData = {}) => {
  const [state, setState] = useState({
    templates: initialData.templates || invoiceTemplateCatalog,
    defaultTemplateId:
      initialData.defaultTemplateId ||
      initialData.invoiceTemplates?.defaultTemplateId ||
      null,
    loading: false,
    updating: false,
    error: null
  })

  const loadDefaultTemplate = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await settingsActions.getDefaultInvoiceTemplate()

      if (result.success) {
        setState(prev => ({
          ...prev,
          defaultTemplateId: result.data?.defaultTemplateId,
          loading: false
        }))

        return result
      }

      throw new Error(result.message)
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to fetch invoice templates')

      setState(prev => ({
        ...prev,
        loading: false,
        error: message
      }))

      return { success: false, message }
    }
  }

  const updateDefaultTemplate = async templateId => {
    setState(prev => ({ ...prev, updating: true, error: null }))

    try {
      const result = await settingsActions.updateDefaultInvoiceTemplate(templateId)

      if (result.success) {
        setState(prev => ({
          ...prev,
          defaultTemplateId: result.data?.defaultTemplateId,
          updating: false
        }))

        return result
      }

      throw new Error(result.message)
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to update invoice template')

      setState(prev => ({
        ...prev,
        updating: false,
        error: message
      }))

      return { success: false, message }
    }
  }

  return {
    state,
    setState,
    templateHandlers: {
      loadDefaultTemplate,
      updateDefaultTemplate,
      clearError: () => setState(prev => ({ ...prev, error: null }))
    }
  }
}

export function dataHandler({
  initialSignatures = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  onError,
  onSuccess
}) {
  const normalizedInitialData = normalizeSignatureCollection(initialSignatures)
  const [signatures, setSignatures] = useState(normalizedInitialData.signatures)
  const [pagination, setPagination] = useState({
    current: initialPagination.current || normalizedInitialData.pagination.current,
    pageSize: initialPagination.pageSize || normalizedInitialData.pagination.pageSize,
    total: initialPagination.total || normalizedInitialData.pagination.total
  })
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async (params = {}) => {
    const page = params.page ?? pagination.current
    const pageSize = params.pageSize ?? pagination.pageSize

    setLoading(true)

    try {
      const result = await settingsActions.getInitialSignaturesData()

      if (result.success) {
        const normalizedData = normalizeSignatureCollection(result.data)
        const nextPagination = {
          current: page,
          pageSize,
          total: normalizedData.pagination.total
        }

        setSignatures(normalizedData.signatures)
        setPagination(nextPagination)
        onSuccess?.(normalizedData.signatures)

        return {
          signatures: normalizedData.signatures,
          pagination: nextPagination
        }
      }

      throw new Error(result.message || 'Failed to fetch signatures')
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to fetch signatures')
      onError?.(message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [onError, onSuccess, pagination.current, pagination.pageSize])

  const handlePageChange = useCallback((eventOrPage, maybePage) => {
    const nextPage = typeof maybePage === 'number' ? maybePage : eventOrPage

    if (typeof nextPage !== 'number') {
      return
    }

    fetchData({ page: nextPage + 1 })
  }, [fetchData])

  const handlePageSizeChange = useCallback(eventOrSize => {
    const nextSize =
      typeof eventOrSize === 'number'
        ? eventOrSize
        : parseInt(eventOrSize.target.value, 10)

    if (!Number.isFinite(nextSize)) {
      return
    }

    fetchData({ page: 1, pageSize: nextSize })
  }, [fetchData])

  return {
    signatures,
    pagination,
    loading,
    fetchData,
    handlePageChange,
    handlePageSizeChange,
    setSignatures,
    setPagination
  }
}

export function actionsHandler({ onSuccess, onError, refetchData }) {
  const executeAction = async (actionFn, successMessage, shouldRefetch = true) => {
    try {
      const result = await actionFn()

      if (result?.success) {
        onSuccess?.(successMessage)

        if (shouldRefetch && refetchData) {
          await refetchData()
        }
      } else {
        onError?.(result?.message || 'Action failed')
      }

      return result
    } catch (error) {
      onError?.(getErrorMessage(error, 'Action failed'))
      throw error
    }
  }

  return {
    handleAdd: formData =>
      executeAction(
        () => settingsActions.addSignature(formData),
        'Signature added successfully!'
      ),
    handleUpdate: (id, formData) =>
      executeAction(
        () => settingsActions.updateSignature(id, formData),
        'Signature updated successfully!'
      ),
    handleDelete: ids =>
      executeAction(
        () => settingsActions.deleteSignatures(normalizeIds(ids)),
        'Signature deleted successfully!'
      ),
    handleSetDefault: id =>
      executeAction(
        () => settingsActions.setDefaultSignature(id),
        'Default signature updated successfully!'
      ),
    handleToggleStatus: (id, status) =>
      executeAction(
        () => settingsActions.updateSignatureStatus(id, status),
        'Signature status updated successfully!'
      )
  }
}

export const useSignatureHandlers = (initialData = {}) => {
  const normalizedInitialData = normalizeSignatureCollection(initialData.signatures || [])
  const [state, setState] = useState({
    signatures: normalizedInitialData.signatures,
    pagination: normalizedInitialData.pagination,
    selectedSignature: initialData.selectedSignature || null,
    loading: false,
    updating: false,
    deleting: false,
    error: null
  })

  const loadSignatures = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await settingsActions.getInitialSignaturesData()

      if (result.success) {
        const normalizedData = normalizeSignatureCollection(result.data)

        setState(prev => ({
          ...prev,
          signatures: normalizedData.signatures,
          pagination: normalizedData.pagination,
          loading: false
        }))

        return result
      }

      throw new Error(result.message)
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to fetch signatures')

      setState(prev => ({
        ...prev,
        loading: false,
        error: message
      }))

      return { success: false, message }
    }
  }

  const loadSignatureById = async id => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await settingsActions.getSignatureById(id)

      if (result.success) {
        const nextSignature = normalizeRecord(result.data)

        setState(prev => ({
          ...prev,
          selectedSignature: nextSignature,
          loading: false
        }))

        return result
      }

      throw new Error(result.message)
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to fetch signature')

      setState(prev => ({
        ...prev,
        loading: false,
        error: message
      }))

      return { success: false, message }
    }
  }

  const addSignature = async formData => {
    setState(prev => ({ ...prev, updating: true, error: null }))

    try {
      const result = await settingsActions.addSignature(formData)

      if (result.success) {
        const nextSignature = normalizeRecord(result.data)

        setState(prev => ({
          ...prev,
          signatures: nextSignature ? mergeItemById(prev.signatures, nextSignature) : prev.signatures,
          selectedSignature: nextSignature || prev.selectedSignature,
          updating: false
        }))

        return result
      }

      throw new Error(result.message)
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to add signature')

      setState(prev => ({
        ...prev,
        updating: false,
        error: message
      }))

      return { success: false, message }
    }
  }

  const updateSignature = async (id, formData) => {
    setState(prev => ({ ...prev, updating: true, error: null }))

    try {
      const result = await settingsActions.updateSignature(id, formData)

      if (result.success) {
        const nextSignature = normalizeRecord(result.data)

        setState(prev => ({
          ...prev,
          signatures: nextSignature ? replaceItemById(prev.signatures, nextSignature) : prev.signatures,
          selectedSignature: nextSignature || prev.selectedSignature,
          updating: false
        }))

        return result
      }

      throw new Error(result.message)
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to update signature')

      setState(prev => ({
        ...prev,
        updating: false,
        error: message
      }))

      return { success: false, message }
    }
  }

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }))
  }

  return {
    state,
    setState,
    dataHandlers: {
      loadSignatures,
      loadSignatureById
    },
    actionHandlers: {
      addSignature,
      updateSignature,
      clearError
    }
  }
}
