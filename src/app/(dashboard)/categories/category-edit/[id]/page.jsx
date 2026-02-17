import { notFound } from 'next/navigation';
import EditCategoryIndex from '@/views/categories/editCategory/index';
import { getCategoryById } from '@/app/(dashboard)/categories/actions';

export const metadata = {
  title: 'Edit Category | Kanakku',
};

const EditCategoryPage = async ({ params }) => {
  const { id } = params;

  try {
    const categoryData = await getCategoryById(id);

    if (!categoryData) {
      notFound();
    }

    return (
      <EditCategoryIndex
        id={id}
        categoryData={categoryData}
      />
    );
  } catch (error) {
    console.error('Error loading category data:', error);
    notFound();
  }
};

export default EditCategoryPage;
