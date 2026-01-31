import { notFound } from 'next/navigation';
import EditProductIndex from '@/views/products/editProduct/index';
import { getProductById } from '@/app/(dashboard)/products/actions';
import ProtectedComponent from '@/components/ProtectedComponent';

export const metadata = {
  title: 'Edit Product | Kanakku',
};

const EditProductPage = async ({ params }) => {
  const { id } = params;

  try {
    const productData = await getProductById(id);

    if (!productData) {
      notFound();
    }

    return (
      <ProtectedComponent>
        <EditProductIndex id={id} />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('Error loading product data:', error);
    notFound();
  }
};

export default EditProductPage;