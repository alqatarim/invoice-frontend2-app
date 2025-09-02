import { notFound } from 'next/navigation';
import EditCategoryIndex from '@/views/categories/editCategory/index';
import { getCategoryById } from '@/app/(dashboard)/categories/actions';
import ProtectedComponent from '@/components/ProtectedComponent';

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
      <ProtectedComponent>
        <EditCategoryIndex
          id={id}
          categoryData={categoryData}
        />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('Error loading category data:', error);
    notFound();
  }
};

export default EditCategoryPage;
