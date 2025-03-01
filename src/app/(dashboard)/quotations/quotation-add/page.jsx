// ** Next Imports
import { notFound } from 'next/navigation'

// ** Component Imports
import AddQuotationIndex from 'src/views/quotations/addQuotation'

// ** Actions Imports
import { getAllCustomers } from '../actions'

export function generateMetadata() {
  return {
    title: 'Add New Quotation'
  }
}

const QuotationAddPage = async () => {
  try {
    // Fetch all customers for the form dropdown
    const customersResponse = await getAllCustomers()
    
    // Return the client component with the fetched data
    return (
      <AddQuotationIndex 
        customers={customersResponse?.success && Array.isArray(customersResponse.data) ? customersResponse.data : []} 
      />
    )
  } catch (error) {
    console.error('Error fetching customers data:', error)
    
    // Return the component with empty customers array
    return <AddQuotationIndex customers={[]} />
  }
}

export default QuotationAddPage
