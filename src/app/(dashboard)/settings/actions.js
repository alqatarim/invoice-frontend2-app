'use server'

import { fetchWithAuth } from '@/Auth/fetchWithAuth'
import * as endPoints from '@/core/end_points/end_points'

/**
 * Account Settings Actions
 */
export async function getAccountSettings() {
  try {
    const response = await fetchWithAuth(endPoints.AccountSettingsview, {
      method: 'GET'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching account settings:', error)
    return { success: false, message: error.message }
  }
}

export async function updateAccountSettings(formData) {
  try {
    const response = await fetchWithAuth(endPoints.AccountSettingsupdate, {
      method: 'PUT',
      body: formData
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating account settings:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Company Settings Actions
 */
export async function getCompanySettings() {
  try {
    const response = await fetchWithAuth(`/companySettings/viewCompanySetting`)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching company settings:', error)
    return { success: false, message: error.message }
  }
}

export async function updateCompanySettings(formData) {
  try {
    const response = await fetchWithAuth(endPoints.CompanysettingUpdate, {
      method: 'PUT',
      body: formData
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating company settings:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Change Password Actions
 */
export async function changePassword(formData) {
  try {
    const response = await fetchWithAuth(endPoints.change_password, {
      method: 'POST',
      body: JSON.stringify({
        oldPassword: formData.get('oldPassword'),
        newPassword: formData.get('newPassword')
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error changing password:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Invoice Settings Actions
 */
export async function getInvoiceSettings() {
  try {
    const response = await fetchWithAuth(endPoints.InvoiceSettingsview, {
      method: 'GET'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching invoice settings:', error)
    return { success: false, message: error.message }
  }
}

export async function updateInvoiceSettings(formData) {
  try {
    const response = await fetchWithAuth(endPoints.InvoiceSettingsUpdate, {
      method: 'PUT',
      body: formData
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating invoice settings:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Payment Settings Actions
 */
export async function getPaymentSettings() {
  try {
    const response = await fetchWithAuth(endPoints.paymentSettingsview, {
      method: 'GET'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching payment settings:', error)
    return { success: false, message: error.message }
  }
}

export async function updatePaymentSettings(formData) {
  try {
    const response = await fetchWithAuth(endPoints.paymentSettingsupdate, {
      method: 'PUT',
      body: formData
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating payment settings:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Preference Settings Actions
 */
export async function getPreferenceSettings() {
  try {
    const response = await fetchWithAuth(endPoints.preferenceSettingsview, {
      method: 'GET'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching preference settings:', error)
    return { success: false, message: error.message }
  }
}

export async function updatePreferenceSettings(formData) {
  try {
    const response = await fetchWithAuth(endPoints.preferenceSettingsupdate, {
      method: 'PUT',
      body: formData
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating preference settings:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Email Settings Actions
 */
export async function getEmailSettings() {
  try {
    const response = await fetchWithAuth(endPoints.EmailSettingsview, {
      method: 'GET'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching email settings:', error)
    return { success: false, message: error.message }
  }
}

export async function updateEmailSettings(formData) {
  try {
    const response = await fetchWithAuth(endPoints.EmailSettingsupdate, {
      method: 'PUT',
      body: formData
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating email settings:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Bank Settings Actions (CRUD operations)
 */
export async function getBankSettings() {
  try {
    const response = await fetchWithAuth(endPoints.BankSettings.List, {
      method: 'GET'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching bank settings:', error)
    return { success: false, message: error.message }
  }
}

// Alias for compatibility
export async function getInitialBankSettingsData() {
  return getBankSettings()
}

export async function getBankById(id) {
  try {
    const response = await fetchWithAuth(`${endPoints.BankSettings.View}/${id}`, {
      method: 'GET'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching bank by id:', error)
    return { success: false, message: error.message }
  }
}

export async function addBankSettings(formData) {
  try {
    const response = await fetchWithAuth(endPoints.BankSettings.Add, {
      method: 'POST',
      body: formData
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error adding bank settings:', error)
    return { success: false, message: error.message }
  }
}

export async function updateBankSettings(id, formData) {
  try {
    const response = await fetchWithAuth(`${endPoints.BankSettings.Upadte}/${id}`, {
      method: 'PUT',
      body: formData
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating bank settings:', error)
    return { success: false, message: error.message }
  }
}

export async function deleteBankSettings(ids) {
  try {
    const response = await fetchWithAuth(endPoints.BankSettings.Delete, {
      method: 'POST',
      body: JSON.stringify({ ids }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error deleting bank settings:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Tax Settings Actions (CRUD operations)
 */
export async function getTaxSettings() {
  try {
    const response = await fetchWithAuth(endPoints.TaxRateAPI.List, {
      method: 'GET'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching tax settings:', error)
    return { success: false, message: error.message }
  }
}

// Alias for compatibility
export async function getInitialTaxSettingsData() {
  return getTaxSettings()
}

export async function getTaxById(id) {
  try {
    const response = await fetchWithAuth(`${endPoints.TaxRateAPI.View}/${id}`, {
      method: 'GET'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching tax by id:', error)
    return { success: false, message: error.message }
  }
}

export async function addTaxSettings(formData) {
  try {
    const response = await fetchWithAuth(endPoints.TaxRateAPI.Add, {
      method: 'POST',
      body: formData
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error adding tax settings:', error)
    return { success: false, message: error.message }
  }
}

export async function updateTaxSettings(id, formData) {
  try {
    const response = await fetchWithAuth(`${endPoints.TaxRateAPI.Upadte}/${id}`, {
      method: 'PUT',
      body: formData
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating tax settings:', error)
    return { success: false, message: error.message }
  }
}

export async function deleteTaxSettings(ids) {
  try {
    const response = await fetchWithAuth(endPoints.TaxRateAPI.Delete, {
      method: 'POST',
      body: JSON.stringify({ ids }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error deleting tax settings:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Signature List Actions (CRUD operations)
 */
export async function getSignatures() {
  try {
    const response = await fetchWithAuth(endPoints.signatures_api.List, {
      method: 'GET'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching signatures:', error)
    return { success: false, message: error.message }
  }
}

// Alias for compatibility
export async function getInitialSignaturesData() {
  return getSignatures()
}

// Alternative delete function for multiple signatures
export async function deleteSignatures(ids) {
  try {
    const response = await fetchWithAuth(endPoints.signatures_api.Delete, {
      method: 'POST',
      body: JSON.stringify({ ids }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error deleting signatures:', error)
    return { success: false, message: error.message }
  }
}

export async function getSignatureById(id) {
  try {
    const response = await fetchWithAuth(`${endPoints.signatures_api.View}/${id}`, {
      method: 'GET'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching signature by id:', error)
    return { success: false, message: error.message }
  }
}

export async function addSignature(formData) {
  try {
    const response = await fetchWithAuth(endPoints.signatures_api.Add, {
      method: 'POST',
      body: formData
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error adding signature:', error)
    return { success: false, message: error.message }
  }
}

export async function updateSignature(id, formData) {
  try {
    const response = await fetchWithAuth(`${endPoints.signatures_api.Upadte}/${id}`, {
      method: 'PUT',
      body: formData
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating signature:', error)
    return { success: false, message: error.message }
  }
}

export async function deleteSignature(id) {
  try {
    const response = await fetchWithAuth(`${endPoints.signatures_api.Delete}/${id}`, {
      method: 'PATCH'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error deleting signature:', error)
    return { success: false, message: error.message }
  }
}

export async function updateSignatureStatus(id, status) {
  try {
    const response = await fetchWithAuth(`${endPoints.signatures_api.statusUpdate}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating signature status:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Invoice Template Actions
 */
export async function getDefaultInvoiceTemplate() {
  try {
    const response = await fetchWithAuth(endPoints.invoiceTemplate.view, {
      method: 'GET'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching default invoice template:', error)
    return { success: false, message: error.message }
  }
}

export async function updateDefaultInvoiceTemplate(templateId) {
  try {
    const response = await fetchWithAuth(endPoints.invoiceTemplate.update, {
      method: 'PUT',
      body: JSON.stringify({ defaultInvoiceTemplate: templateId }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating default invoice template:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Currencies Actions (for preference settings)
 */
export async function getCurrencies() {
  try {
    const response = await fetchWithAuth(endPoints.CurrencyAPI, {
      method: 'GET'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching currencies:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Notification Settings Actions
 * Note: These endpoints are not defined in the endPoints file yet,
 * so we'll use the expected backend API paths directly
 */
export async function getNotificationSettings() {
  try {
    const response = await fetchWithAuth('/notificationSettings/viewNotificationSettings', {
      method: 'GET'
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching notification settings:', error)
    return { success: false, message: error.message }
  }
}

export async function updateNotificationSettings(formData) {
  try {
    const response = await fetchWithAuth('/notificationSettings/updateNotificationSettings', {
      method: 'PUT',
      body: formData
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating notification settings:', error)
    return { success: false, message: error.message }
  }
}