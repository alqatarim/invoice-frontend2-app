// ** Next Imports
import { notFound } from 'next/navigation'

// ** Component Imports
import AddQuotationIndex from 'src/views/quotations/addQuotation'

// ** Actions Imports
import {
  getBanks,
  getCustomers,
  getProducts,
  getQuotationNumber,
  getSignatures,
  getTaxes,
  getUnits
} from '../actions'

export function generateMetadata() {
  return {
    title: 'Add New Quotation'
  }
}

const QuotationAddPage = async () => {
  let initialCustomers = []
  let initialProducts = []
  let initialTaxRates = []
  let initialBanks = []
  let initialSignatures = []
  let initialQuotationNumber = ''
  let initialErrorMessage = ''

  try {
    const [customers, products, taxes, banks, signatures, units, quotationNumberResponse] = await Promise.all([
      getCustomers(),
      getProducts(),
      getTaxes(),
      getBanks(),
      getSignatures(),
      getUnits(),
      getQuotationNumber()
    ])

    initialCustomers = customers || []
    initialProducts = products || []
    initialTaxRates = taxes || []
    initialBanks = banks || []
    initialSignatures = signatures || []
    initialQuotationNumber = quotationNumberResponse?.quotationNumber || ''
  } catch (error) {
    console.error('Error fetching quotation data:', error)
    initialErrorMessage = error?.message || 'Error fetching quotation data.'
  }

  return (
    <AddQuotationIndex
      initialCustomers={initialCustomers}
      initialProducts={initialProducts}
      initialTaxRates={initialTaxRates}
      initialBanks={initialBanks}
      initialSignatures={initialSignatures}
      initialQuotationNumber={initialQuotationNumber}
      initialErrorMessage={initialErrorMessage}
    />
  )
}

export default QuotationAddPage
