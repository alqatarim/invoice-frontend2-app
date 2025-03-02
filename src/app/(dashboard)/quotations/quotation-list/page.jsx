import QuotationListIndex from '@/views/quotations/listQuotation/index';
import { getQuotationsList, getCustomers } from '@/app/(dashboard)/quotations/actions';

export const metadata = {
  title: 'Quotation List | Invoices'
};

async function QuotationListPage() {
  try {
    // Fetch data in parallel for better performance
    const [quotationsData, customers] = await Promise.all([
      getQuotationsList(),
      getCustomers()
    ]);

    return (
      <QuotationListIndex 
        initialData={quotationsData} 
        customers={customers} 
      />
    );
  } catch (error) {
    console.error('Error in QuotationListPage:', error);

    // Return a more user-friendly error component
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold text-red-500 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600">
          Unable to load quotations. Please try again later.
        </p>
      </div>
    );
  }
}

export default QuotationListPage;
