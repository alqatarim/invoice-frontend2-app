// ** Next Imports
import { notFound } from 'next/navigation'

// ** Component Imports
import AddQuotationIndex from 'src/views/quotations/addQuotation'

// ** Actions Imports
import { getDropdownData, getQuotationNumber } from '../actions'

export function generateMetadata() {
  return {
    title: 'Add New Quotation'
  }
}

const QuotationAddPage = async () => {
  try {
    // Fetch all dropdown data and quotation number in parallel
    const [dropdownData, quotationNumberResponse] = await Promise.all([
      getDropdownData(),
      getQuotationNumber()
    ])

    // Return the client component with the fetched data
    return (
      <AddQuotationIndex
        customersData={dropdownData.customers || []}
        productData={dropdownData.products || []}
        taxRates={dropdownData.taxRates || []}
        initialBanks={dropdownData.banks || []}
        signatures={dropdownData.signatures || []}
        quotationNumber={quotationNumberResponse?.quotationNumber || ''}
      />
    )
  } catch (error) {
    console.error('Error fetching quotation data:', error)

    // Return the component with empty data arrays
    return (
      <AddQuotationIndex
        customersData={[]}
        productData={[]}
        taxRates={[]}
        initialBanks={[]}
        signatures={[]}
        quotationNumber=""
      />
    )
  }
}

export default QuotationAddPage
