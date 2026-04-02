// ** Next Imports
import { notFound } from 'next/navigation'

// ** Component Imports
import EditQuotationIndex from 'src/views/quotations/editQuotation/index'

// ** Actions Imports
import {
  getBanks,
  getCustomers,
  getProducts,
  getQuotationDetails,
  getSignatures,
  getTaxes,
  getUnits
} from '@/app/(dashboard)/quotations/actions'

export async function generateMetadata({ params }) {
  try {
    // Validate params
    if (!params?.id) {
      return { title: 'Invalid Quotation ID' }
    }

    // Get quotation details
    const response = await getQuotationDetails(params.id)

    // If quotation found, set title with quotation number
    if (response?.success && response?.data) {
      return {
        title: `Edit Quotation - ${response.data.quotationNumber || 'Not Found'}`
      }
    }

    // Default title if quotation not found
    return {
      title: 'Edit Quotation - Not Found'
    }
  } catch (error) {
    console.error('Error generating metadata:', error)

    return {
      title: 'Edit Quotation'
    }
  }
}

const QuotationEditPage = async ({ params }) => {
  let initialQuotationData = null
  let initialCustomers = []
  let initialProducts = []
  let initialTaxRates = []
  let initialBanks = []
  let initialSignatures = []
  let initialUnits = []
  let initialErrorMessage = ''

  try {
    // Validate params
    if (!params?.id) {
      return notFound()
    }

    // Fetch quotation details and all dropdown data in parallel
    const [quotationResponse, customers, products, taxes, banks, signatures, units] = await Promise.all([
      getQuotationDetails(params.id),
      getCustomers(),
      getProducts(),
      getTaxes(),
      getBanks(),
      getSignatures(),
      getUnits()
    ])

    // If quotation is not found, show 404
    if (!quotationResponse?.success || !quotationResponse?.data) {
      initialErrorMessage = quotationResponse?.message || 'Quotation not found'
    } else {
      initialQuotationData = quotationResponse.data
    }

    initialCustomers = customers || []
    initialProducts = products || []
    initialTaxRates = taxes || []
    initialBanks = banks || []
    initialSignatures = signatures || []
    initialUnits = units || []
  } catch (error) {
    console.error('Error fetching quotation data:', error)
    initialErrorMessage = error?.message || 'Error fetching quotation data.'
  }

  if (!initialQuotationData && !initialErrorMessage) {
    return notFound()
  }

  return (
    <EditQuotationIndex
      initialQuotationData={initialQuotationData}
      initialCustomers={initialCustomers}
      initialProducts={initialProducts}
      initialTaxRates={initialTaxRates}
      initialBanks={initialBanks}
      initialSignatures={initialSignatures}
      initialUnits={initialUnits}
      initialErrorMessage={initialErrorMessage}
    />
  )
}

export default QuotationEditPage
