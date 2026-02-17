import { notFound } from 'next/navigation';
import EditProductIndex from '@/views/products/editProduct/index';
import { getProductById } from '@/app/(dashboard)/products/actions';

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
      <EditProductIndex id={id} />
    );
  } catch (error) {
    console.error('Error loading product data:', error);
    notFound();
  }
};

export default EditProductPage;