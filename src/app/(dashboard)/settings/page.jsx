import {
  getCompanySettings,
  getAccountSettings,
  getInvoiceSettings,
  getPaymentSettings,
  getPreferenceSettings,
  getCurrencies,
  getEmailSettings,
  getNotificationSettings,
  getBankSettings,
  getTaxSettings,
  getSignatures,
  getDefaultInvoiceTemplate
} from './actions'
import UnifiedSettingsIndex from '@/views/settings/index'

export default async function SettingsPage() {
  // Fetch all settings data in parallel for better performance
  const [
    companyResult,
    accountResult,
    invoiceResult,
    paymentResult,
    preferenceResult,
    currenciesResult,
    emailResult,
    notificationResult,
    bankResult,
    taxResult,
    signaturesResult,
    templateResult
  ] = await Promise.allSettled([
    getCompanySettings(),
    getAccountSettings(),
    getInvoiceSettings(),
    getPaymentSettings(),
    getPreferenceSettings(),
    getCurrencies(),
    getEmailSettings(),
    getNotificationSettings(),
    getBankSettings(),
    getTaxSettings(),
    getSignatures(),
    getDefaultInvoiceTemplate()
  ])

  // Helper function to extract data safely
  const extractData = (result) => {
    if (result.status === 'fulfilled' && result.value?.success) {
      return result.value.data
    }
    return null
  }

  const initialData = {
    companySettings: extractData(companyResult) || {},
    accountSettings: extractData(accountResult) || {},
    invoiceSettings: extractData(invoiceResult) || {},
    paymentSettings: extractData(paymentResult) || {},
    preferenceSettings: extractData(preferenceResult) || {},
    currencies: extractData(currenciesResult) || [],
    emailSettings: extractData(emailResult) || {},
    notificationSettings: extractData(notificationResult) || {},
    bankSettings: {
      banks: extractData(bankResult)?.data || [],
      pagination: {
        page: 0,
        totalCount: extractData(bankResult)?.totalCount || 0,
        limit: 10
      }
    },
    taxSettings: {
      taxes: extractData(taxResult)?.data || [],
      pagination: {
        page: 0,
        totalCount: extractData(taxResult)?.totalCount || 0,
        limit: 10
      }
    },
    signatures: extractData(signaturesResult) || [],
    invoiceTemplates: extractData(templateResult) || {},
    loading: false,
    error: null
  }

  return <UnifiedSettingsIndex initialData={initialData} />
}