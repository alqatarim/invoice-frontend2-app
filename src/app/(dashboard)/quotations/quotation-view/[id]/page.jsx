import QuotationViewIndex from '@/views/quotations/viewQuotation/index';
import { getQuotationDetails } from '@/app/(dashboard)/quotations/actions';
import { notFound } from 'next/navigation';

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
