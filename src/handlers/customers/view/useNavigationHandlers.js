import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Navigation handler for customer view actions
 */
export const useNavigationHandlers = ({ customerId, customer }) => {
  const router = useRouter()

  // Handle back navigation
  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  // Handle navigation to customer edit
  const handleEditCustomer = useCallback(() => {
    if (customerId) {
      router.push(`/customers/edit/${customerId}`)
    }
  }, [customerId, router])

  // Handle navigation to create invoice
  const handleCreateInvoice = useCallback(() => {
    if (customerId) {
      router.push(`/invoices/add?customerId=${customerId}`)
    }
  }, [customerId, router])

  // Handle navigation to customer list
  const handleGoToCustomerList = useCallback(() => {
    router.push('/customers/customer-list')
  }, [router])

  // Handle navigation to invoice list for this customer
  const handleViewAllInvoices = useCallback(() => {
    if (customerId) {
      router.push(`/invoices/invoice-list?customerId=${customerId}`)
    }
  }, [customerId, router])

  return {
    // Navigation actions
    handleBack,
    handleEditCustomer,
    handleCreateInvoice,
    handleGoToCustomerList,
    handleViewAllInvoices
  }
} 