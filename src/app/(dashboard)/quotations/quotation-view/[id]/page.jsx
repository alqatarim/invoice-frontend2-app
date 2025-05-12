import QuotationViewIndex from '@/views/quotations/viewQuotation/index';
import { getQuotationDetails, getUnits, getProducts } from '@/app/(dashboard)/quotations/actions';
import { notFound } from 'next/navigation';

async function QuotationViewPage({ params }) {
  try {
    const { id } = params;
    const response = await getQuotationDetails(id);

    // Fetch units and products data
    const unitsList = await getUnits();
    const productsList = await getProducts();

    if (!response.success || !response.data) {
      notFound();
    }

    return (
      <QuotationViewIndex
        quotationData={response.data}
        unitsList={unitsList}
        productsList={productsList}
      />
    );
  } catch (error) {
    console.error('Error in QuotationViewPage:', error);
    notFound();
  }
}

export default QuotationViewPage;
