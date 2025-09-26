// ** Next Imports
import { notFound } from 'next/navigation'

// ** Component Imports
import EditQuotationIndex from 'src/views/quotations/editQuotation/index'

// ** Actions Imports
import { getQuotationDetails, getDropdownData } from '@/app/(dashboard)/quotations/actions'

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
  try {
    // Validate params
    if (!params?.id) {
      return notFound()
    }

    // Fetch quotation details and all dropdown data in parallel
    const [quotationResponse, dropdownData] = await Promise.all([
      getQuotationDetails(params.id),
      getDropdownData()
    ])

    // If quotation is not found, show 404
    if (!quotationResponse?.success || !quotationResponse?.data) {
      return notFound()
    }

    // Return the client component with the fetched data
    return (
      <EditQuotationIndex
        quotationData={quotationResponse.data}
        customers={dropdownData.customers || []}
        products={dropdownData.products || []}
        taxRates={dropdownData.taxRates || []}
        banks={dropdownData.banks || []}
        signatures={dropdownData.signatures || []}
        units={dropdownData.units || []}
      />
    )
  } catch (error) {
    console.error('Error fetching quotation data:', error)

    // Show 404 on error
    return notFound()
  }
}

export default QuotationEditPage
