// ** Next Imports
import { notFound } from 'next/navigation'

// ** Component Imports
import EditQuotationIndex from 'src/views/quotations/editQuotation'

// ** Actions Imports
import { getQuotationById, getAllCustomers } from '../../actions'

export async function generateMetadata({ params }) {
  try {
    // Validate params
    if (!params?.id) {
      return { title: 'Invalid Quotation ID' }
    }
    
    // Get quotation details
    const response = await getQuotationById(params.id)
    
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
    
    // Fetch quotation details
    const quotationResponse = await getQuotationById(params.id)
    
    // Fetch all customers for the form dropdown
    const customersResponse = await getAllCustomers()
    
    // If quotation is not found, show 404
    if (!quotationResponse?.success || !quotationResponse?.data) {
      return notFound()
    }
    
    // Return the client component with the fetched data
    return (
      <EditQuotationIndex 
        quotationData={quotationResponse.data} 
        customers={customersResponse?.success && Array.isArray(customersResponse.data) ? customersResponse.data : []} 
      />
    )
  } catch (error) {
    console.error('Error fetching quotation data:', error)
    
    // Show 404 on error
    return notFound()
  }
}

export default QuotationEditPage
