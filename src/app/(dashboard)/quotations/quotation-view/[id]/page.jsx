import QuotationViewIndex from '@/views/quotations/viewQuotation/index';
import { getQuotationDetails } from '@/app/(dashboard)/quotations/actions';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  try {
    const { id } = params;
    const response = await getQuotationDetails(id);
    
    if (!response.success) {
      return {
        title: 'Quotation Not Found | Invoices'
      };
    }
    
    return {
      title: `Quotation #${response.data.quotationNumber} | Invoices`
    };
  } catch (error) {
    return {
      title: 'View Quotation | Invoices'
    };
  }
}

async function QuotationViewPage({ params }) {
  try {
    const { id } = params;
    const response = await getQuotationDetails(id);

    if (!response.success || !response.data) {
      notFound();
    }

    return (
      <QuotationViewIndex quotationData={response.data} />
    );
  } catch (error) {
    console.error('Error in QuotationViewPage:', error);
    notFound();
  }
}

export default QuotationViewPage;
