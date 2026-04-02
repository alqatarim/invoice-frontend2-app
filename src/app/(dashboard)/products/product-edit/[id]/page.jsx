import { notFound } from 'next/navigation';
import EditProductIndex from '@/views/products/editProduct/index';
import { getDropdownData, getProductById } from '@/app/(dashboard)/products/actions';

export const metadata = {
  title: 'Edit Product | Kanakku',
};

const EditProductPage = async ({ params }) => {
  const { id } = params;
  let initialProductData = null;
  let initialDropdownData = { units: [], categories: [], taxes: [] };
  let initialErrorMessage = '';

  try {
    const [productData, dropdownResponse] = await Promise.all([
      getProductById(id),
      getDropdownData(),
    ]);

    if (!productData) {
      notFound();
    }

    initialProductData = productData;
    initialDropdownData = dropdownResponse?.data || initialDropdownData;
  } catch (error) {
    console.error('Error loading product data:', error);
    initialErrorMessage = error?.message || 'Failed to load product data.';
  }

  return (
    <EditProductIndex
      id={id}
      initialProductData={initialProductData}
      initialDropdownData={initialDropdownData}
      initialErrorMessage={initialErrorMessage}
    />
  );
};

export default EditProductPage;